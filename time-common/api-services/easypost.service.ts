import { Order } from '../models/Order';
require('dotenv').config();
const Easypost = require('node-easypost');
const api = new Easypost(process.env.EASYPOST_API_KEY);

export class EasypostService {
	constructor() {}

	/**
	 * Create a shipment in EasyPost
	 *
	 * @param {Address} options.to_address
	 * @param {Address} options.from_address
	 * @param {Parcel} options.parcel
	 * @param {number} options.parcel.length
	 * @param {number} options.parcel.width
	 * @param {number} options.parcel.height
	 * @param {number} options.parcel.weight
	 * @param {object} options.customs_info
	 * @param {string} orderId 
	 * @param {function} done - (error, Order, easypost_shipment)
	 */
	createShipment(options, orderId, done) {
	    console.log("Easypost shipment options:");
	    console.log(options);

	    /* Either objects or ids can be passed in. If the object does
		 * not have an id, it will be created. */

		const to_address = new api.Address(options.to_address);
		const from_address = new api.Address(options.from_address);
		const parcel = new api.Parcel(options.parcel);
		const customs_info = new api.CustomsInfo(options.customs_info);

		const shipment = new api.Shipment({
			to_address,
			from_address,
			parcel,
			customs_info,
		});

		shipment.save().then(_shipment => {
			if (!_shipment) return done("Couldn't create the shipment");
			Order.findById(orderId, (err, order) => {
				if (err) return done(err);
				console.log("<<<<<<<<  RATES  >>>>>>>>");
				console.log(_shipment.rates);
				order.shipmentId = _shipment.id;
				order.shippingRates = _shipment.rates;
				order.markModified('shippingRates');
				order.save((_err, _order) => {
					done(_err, _order, _shipment);
				});
			});
		}, done);
	}

	/**
	 * Buy a shipment in EasyPost
	 *
	 * @param {string} orderId
	 * @param {string} rateId
	 * @param {string} shipmentId (Order.shipmentId)
	 * @param {number} insurance - Amount the shipment will be insured for
	 * @param {function} done - (error, Order, easypost.Shipment)
	 */
	buyShipment({orderId, rateId, shipmentId, insurance, estDeliveryDays}, done) {
		api.Shipment.retrieve(shipmentId).then(s => {
		    s.buy(rateId || s.lowestRate(), insurance).then(_shipment => {
		  		if (!_shipment) return done("Couldn't purchase the shipment");
				Order.findById(orderId, (err, order) => {
					if (err) return done(err);
					order.status = 'Shipped';
					order.selectedShippingRate = _shipment.selected_rate;
					order.carrier = _shipment.selected_rate ? _shipment.selected_rate.carrier : null;
					order.trackingCode = _shipment.tracking_code;
					order.postageLabel = _shipment.postage_label;
					order.estDeliveryDays = estDeliveryDays;
					order.save((_err, _order) => {
						done(_err, _order, _shipment);
					});
				});
			}).catch(done);
		}).catch(done);
	}

	/**
	 * Verify a customer's shipping address before they place an order
	 *
	 * @param {Address} address - The customer's shipping address from the order
	 * @param {function} done - (err, address)
	 */
	verifyAddress(address, done) {
	    if (!address) return done("No shipping address was provided");
	    const addrToVerify = new api.Address(address);

		addrToVerify.save().then((addr) => {
			if (addr.verifications.delivery.success) {
				done(null, addr);
			}
			else {
				done("The shipping address provided is undeliverable or invalid.");
			}
    	}).catch(done);
	}
}