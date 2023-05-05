const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
    userId: String,
    uniqueString: String,
    createdDate: Date,
    expiresDate: Date,
});


const UserVerification = mongoose.model('UserVerification', UserVerificationSchema);

module.exports = UserVerification;