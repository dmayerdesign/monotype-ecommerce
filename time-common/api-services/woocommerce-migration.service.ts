import { injectable } from 'inversify';
import { Error } from 'mongoose';
import { IProduct } from '../models/interfaces';
import { Product } from '../models/db-models';
import { CONSTANTS } from '../constants';
import { DbClient } from '../api-utils';
import { appConfig } from '../config/app-config';
import * as productsJSON from '../work-files/migration/hyzershop-products';

@injectable()
export class WoocommerceMigrationService {

	public createProductsFromExportedJSON(): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let newProducts = [];

			productsJSON.forEach(product => {

				let newProduct: any = { ...product };
				let attributes = [];
				let taxonomies = [];

				Object.keys(product).forEach(key => {
					if (typeof newProduct[key] !== "undefined" && newProduct[key] !== undefined && newProduct[key] !== "") {
						console.log("FIELD (" + key + ")", newProduct[key]);

						if (key.indexOf('attributes.') > -1) {
							let attribute: any = {};
							attribute.key = key.replace("attributes.", "");
							attribute.name = attribute.key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
							attribute.value = product[key];
							attributes.push(attribute);
							delete newProduct[key];
						}
						if (key.indexOf('taxonomies.') > -1) {
							let taxonomy = {
								key: key.replace("taxonomies.", ""),
								values: product[key].split("|"),
							};
							taxonomies.push(taxonomy);
							delete newProduct[key];
						}
						if (key === "netWeight") {
							newProduct[key] = newProduct[key].replace(/g/g, "");
							if ( newProduct[key].indexOf("|") > -1 ) {
								delete newProduct[key];
							}
						}
						if (key === "price") {
							console.log("Price:", newProduct[key]);
							if ( newProduct[key].toString().indexOf("-") > -1 ) {
								newProduct.priceRange = newProduct[key].split("-");
								newProduct.priceRange[0] = +newProduct.priceRange[0];
								newProduct.priceRange[1] = +newProduct.priceRange[1];
								delete newProduct[key];
							}
						}
						if (key === "salePrice") {
							if ( newProduct[key].toString().indexOf("-") > -1 ) {
								newProduct.salePriceRange = newProduct[key].split("-");
								newProduct.salePriceRange[0] = +newProduct.salePriceRange[0];
								newProduct.salePriceRange[1] = +newProduct.salePriceRange[1];
								delete newProduct[key];
							}
						}

						if (key === "class") {
							if (newProduct.class === "Variable") {
								newProduct.isParent = true;
								newProduct.class = "parent";
							}
							if (newProduct.class === "Variation") {
								newProduct.isVariation = true;
								newProduct.class = "variation";
							}
							if (newProduct.class === "Simple Product") {
								newProduct.isStandalone = true;
								newProduct.class = "standalone";
							}
						}

						if (key === "description") {
							if (newProduct.description) {
								newProduct.description = newProduct.description.replace(/http:\/\/stage\.hyzershop\.com\/product/g, '/shop/product');
								newProduct.description = newProduct.description.replace(/Š—È/g, '\'');
								newProduct.description = newProduct.description.replace('<div class="longdescription">', '\n');
								newProduct.description = newProduct.description.replace('</div>', '');
							}
						}
					}
				});

				newProduct.attributes = attributes;
				newProduct.taxonomies = taxonomies;

				let stats: {
					fade?: number;
					glide?: number;
					speed?: number;
					turn?: number;
				} = {};
				newProduct.attributes.forEach(attribute => {
					if (attribute.key === 'fade') {
						stats.fade = +attribute.value;
					}
					if (attribute.key === 'glide') {
						stats.glide = +attribute.value;
					}
					if (attribute.key === 'speed') {
						stats.speed = +attribute.value;
					}
					if (attribute.key === 'turn') {
						stats.turn = +attribute.value;
					}
				});

				let stability = function(stats) {
					if ( stats.fade + stats.turn >= 3 ) {
						return "overstable";
					}
					else if ( stats.fade + stats.turn < 3 && stats.fade + stats.turn >= 0 ) {
						return "stable";
					}
					else if ( stats.fade + stats.turn < 0 ) {
						return "understable";
					}
				};

				if (stability(stats)) {
					newProduct.taxonomies.push({
						key: "stability",
						values: [ stability(stats) ],
					});

					newProduct.attributes.push({
						key: "stability",
						name: "Stability",
						value: stability(stats),
					});
				}

				delete newProduct.stability;
				delete newProduct.featuredImage;

				/**
				 * Add images
				 */
				if (!newProduct.isParent) {
					let isDisc;
					let imageBaseUrl = `${appConfig.cloudfront_url}/product-images/`;
					newProduct.taxonomies.forEach(tax => {
						if (tax.key === "brand") {
							tax.values.forEach(term => {
								if (term.indexOf("MVP") > -1) {
									imageBaseUrl += "mvp-";
								}
								if (term.indexOf("Axiom") > -1) {
									imageBaseUrl += "axiom-";
								}
								if (term.indexOf("Discraft") > -1) {
									imageBaseUrl += "discraft-";
								}
							});
						}
					});

					isDisc = newProduct.attributes.some(attr => attr.key === "productType" && attr.value === "disc");

					if (newProduct.isVariation) imageBaseUrl += `${newProduct.parentSKU.toLowerCase()}-`;
					else imageBaseUrl += `${newProduct.SKU.toLowerCase()}-`;

					if (isDisc) {
						newProduct.attributes.forEach(attr => {
							if (attr.key === "plastic") {
								imageBaseUrl += `${attr.value.toLowerCase()}-`;
							}
						});
						imageBaseUrl += newProduct.netWeight.toString().replace(".", "");
					} else {
						newProduct.attributes.forEach(attr => {
							if (attr.key === "color") {
								imageBaseUrl += `${attr.value.toLowerCase()}-`;
							}
						});
					}

					newProduct.featuredImages = [];
					newProduct.largeImages = [];
					newProduct.images = [];
					newProduct.thumbnails = [];

					newProduct.featuredImages.push(imageBaseUrl + "-medium.png");
					newProduct.largeImages.push(imageBaseUrl + "-large.png");
					newProduct.thumbnails.push(imageBaseUrl + "-thumbnail.png");
				} else {
					newProduct.featuredImages = [];
					newProduct.largeImages = [];
					newProduct.images = [];
					newProduct.thumbnails = [];
				}

				newProducts.push(newProduct);
			});

			newProducts.forEach((product, index, products) => {
				let variations = [];
				if (product.isParent) {
					variations = products.filter(p => product.SKU === p.parentSKU);
					variations.forEach(pv => {
						products[index].images = products[index].images.concat(pv.images);
						products[index].featuredImages = products[index].featuredImages.concat(pv.featuredImages);
						products[index].largeImages = products[index].largeImages.concat(pv.largeImages);
						products[index].thumbnails = products[index].thumbnails.concat(pv.thumbnails);
					});
				}
			});

			/*************
			 * The switch
			 ******* -> */
			Product.create(newProducts)
				.then(products => resolve(products))
				.catch(err => reject(err));
			/**/
		});
	}
}
