import { injectable } from 'inversify';
import { Error } from 'mongoose';
import { IProduct } from '@time/common/models/interfaces';
import { Product } from '@time/common/models/api-models';
import { CONSTANTS } from '@time/common/constants';
import { DbClient } from '@time/common/api-utils';
import * as productsJSON from '@time/common/work-files/migration/hyzershop-products';

@injectable()
export class WoocommerceMigrationService {

	public createProductsFromExportedJSON(appConfig): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let newProducts = [];

			(<any>productsJSON).forEach(product => {

				let newProduct: IProduct = Object.assign({}, product);
				let attributeValues = [];
				let taxonomyTermSlugs = [];

				Object.keys(product).forEach(key => {
					if (typeof newProduct[key] !== "undefined" && newProduct[key] !== undefined && newProduct[key] !== "") {

						if (key.indexOf("attributes.") > -1) {
							let attributeValue = {
								attribute: key.replace("attributes.", ""),
								value: product[key],
							};
							attributeValues.push(attributeValue);
							delete newProduct[key];
						}
						if (key.indexOf("taxonomies.") > -1) {
							let terms = product[key].split("|");
							terms.forEach(term => {
								taxonomyTermSlugs.push(
									key.replace("taxonomies.", "") + "-" + term
								);
							});
							delete newProduct[key];
						}
						if (key === "netWeight") {
							newProduct[key] = (<any>newProduct[key]).replace(/g/g, "");
							if ( (<any>newProduct[key]).indexOf("|") > -1 ) {
								delete newProduct[key];
							}
						}
						if (key === "price") {
							if ( newProduct[key].toString().indexOf("-") > -1 ) {
								newProduct.priceRange = (<any>newProduct[key]).split("-");
								newProduct.priceRange[0] = +newProduct.priceRange[0];
								newProduct.priceRange[1] = +newProduct.priceRange[1];
								delete newProduct[key];
							}
						}
						if (key === "salePrice") {
							if ( newProduct[key].toString().indexOf("-") > -1 ) {
								newProduct.salePriceRange = (<any>newProduct[key]).split("-");
								newProduct.salePriceRange[0] = +newProduct.salePriceRange[0];
								newProduct.salePriceRange[1] = +newProduct.salePriceRange[1];
								delete newProduct[key];
							}
						}

						if (key === "class") {
							if ((<string>newProduct.class) === "Variable") {
								newProduct.isParent = true;
								newProduct.class = "parent";
							}
							if ((<string>newProduct.class) === "Variation") {
								newProduct.isVariation = true;
								newProduct.class = "variation";
							}
							if ((<string>newProduct.class) === "Simple Product") {
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
					else {
						delete newProduct[key];
					}
				});

				newProduct.attributeValues = attributeValues;
				newProduct.taxonomyTermSlugs = taxonomyTermSlugs;


				/**
				 * Flight stats
				 */
				let stats: {
					fade?: number;
					glide?: number;
					speed?: number;
					turn?: number;
				} = {};

				newProduct.attributeValues.forEach(attribute => {
					if (attribute.attribute === 'fade') {
						stats.fade = +attribute.value;
					}
					if (attribute.attribute === 'glide') {
						stats.glide = +attribute.value;
					}
					if (attribute.attribute === 'speed') {
						stats.speed = +attribute.value;
					}
					if (attribute.attribute === 'turn') {
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
					newProduct.taxonomyTermSlugs.push(
						"stability-" + stability(stats)
					);

					newProduct.attributeValues.push({
						attribute: "stability",
						value: stability(stats),
					});
				}

				delete (<any>newProduct).stability;
				delete (<any>newProduct).featuredImage;

				/**
				 * Add images
				 */
				if (!newProduct.isParent) {
					let isDisc;
					let imageBaseUrl = `${appConfig.cloudfront_url}/product-images/`;
					newProduct.taxonomyTermSlugs.forEach(term => {
						if (term.indexOf("brand") === 0) {
							if (term.indexOf("MVP") > -1) {
								imageBaseUrl += "mvp-";
							}
							if (term.indexOf("Axiom") > -1) {
								imageBaseUrl += "axiom-";
							}
							if (term.indexOf("Discraft") > -1) {
								imageBaseUrl += "discraft-";
							}
						}
					});

					isDisc = newProduct.attributeValues.some(attr => attr.attribute === "productType" && attr.value === "disc");

					if (newProduct.parentSKU && newProduct.isVariation) imageBaseUrl += `${newProduct.parentSKU.toLowerCase()}-`;
					else if (newProduct.SKU) imageBaseUrl += `${newProduct.SKU.toLowerCase()}-`;

					if (isDisc) {
						newProduct.attributeValues.forEach(attr => {
							if (attr.attribute === "plastic") {
								imageBaseUrl += `${attr.value.toLowerCase()}-`;
							}
						});
						imageBaseUrl += newProduct.netWeight.toString().replace(".", "");
					} else {
						newProduct.attributeValues.forEach(attr => {
							if (attr.attribute === "color") {
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
				delete (<any>newProduct).thumbnail;

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
