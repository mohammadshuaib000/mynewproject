import mongoose from 'mongoose';

const CustomerProfileSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            default: null, // optional
        },
        lastName: {
            type: String,
            trim: true,
            default: null, // optional
        },
        profilePhoto: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/.+/.test(v); // allow empty OR valid URL
                },
                message: props => `${props.value} is not a valid URL!`
            },
            default: null,
        },
        customerAuth: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CustomerAuth', // adjust this if your actual CustomerAuth model name is different
            required: true,
            unique: true, // one-to-one
        },
    },
    { timestamps: true }
);

export const CustomerProfile = mongoose.model('CustomerProfile', CustomerProfileSchema);
