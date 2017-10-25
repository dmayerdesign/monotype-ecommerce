// id	string	Unique identifier, begins with "ins_"
// object	string	"Insurance"
// mode	string	"test" or "production"
// reference	string	The unique reference for this Insurance, if any
// amount	string	USD value of insured goods with sub-cent precision
// provider	string	The insurance provider used by EasyPost
// provider_id	string	An identifying number for some insurance providers used by EasyPost
// shipment_id	string	The ID of the Shipment in EasyPost, if postage was purchased via EasyPost
// tracking_code	string	The tracking code of either the shipment within EasyPost, or provided by you during creation
// status	string	The current status of the insurance, possible values are "new", "pending", "purchased", "failed", or "cancelled"
// tracker	Tracker	The associated Tracker object
// to_address	Address	The associated Address object for destination
// from_address	Address	The associated Address object for origin
// fee	Fee	The associated InsuranceFee object if any
// messages	Array of strings	The list of errors encountered during attempted purchase of the insurance
// created_at	datetime
// updated_at	datetime
