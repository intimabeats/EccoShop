import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

// Initialize Stripe with your secret key.  Make SURE this is coming from
// functions.config() and *NOT* from a hardcoded value or an environment
// variable that's exposed to the client.
const stripe = new Stripe(functions.config().stripe.secretkey, {
  apiVersion: '2023-10-16', // Replace with the latest API version.
});

export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check (REQUIRED):
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  // 2. Input Validation (REQUIRED):
  const { items, total, name, email, address } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The "items" array must be provided and not empty.');
  }
  if (typeof total !== 'number' || total <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The "total" must be a positive number.');
  }
  if (!name || typeof name !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "name" must be a string.');
  }
  if (!email || typeof email !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "email" must be a string.');
  }
  if (!address || typeof address !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'The "address" must be an object.');
  }
    if (!address.street || typeof address.street !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "address.street" must be a string.');
    }
    if (!address.city || typeof address.city !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "address.city" must be a string.');
    }
    if (!address.state || typeof address.state !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "address.state" must be a string.');
    }
    if (!address.zipCode || typeof address.zipCode !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "address.zipCode" must be a string.');
    }
    if (!address.country || typeof address.country !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The "address.country" must be a string.');
    }


  // 3. Create Payment Intent (with error handling):
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,         // Use the total provided by the client.
      currency: 'brl',       // Or your desired currency.
      automatic_payment_methods: { enabled: true },
      receipt_email: email,   // Use the customer's email.
      shipping: {            // Provide shipping information.
        name: name,
        address: {
          line1: address.street,
          line2: address.complement || null, // Optional
          city: address.city,
          state: address.state,
          postal_code: address.zipCode,
          country: address.country,
        },
      },
      // Consider adding metadata for your own records.
      metadata: {
        userId: context.auth.uid,  // Link the payment to the Firebase user.
        // Add other relevant metadata here.
      }
    });

    // 4. Return Client Secret (REQUIRED):
    return { clientSecret: paymentIntent.client_secret };

  } catch (error) {
    // 5. Error Handling (REQUIRED):
    console.error('Error creating Stripe Payment Intent:', error);

    // Provide more specific error messages based on the Stripe error type.
    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          // A declined card, insufficient funds, etc.
          throw new functions.https.HttpsError('invalid-argument', `Card error: ${error.message}`);
        case 'StripeInvalidRequestError':
          // Invalid parameters were supplied to Stripe's API.
          throw new functions.https.HttpsError('invalid-argument', `Invalid request: ${error.message}`);
        case 'StripeAPIError':
          // An error occurred internally with Stripe's API.
          throw new functions.https.HttpsError('internal', 'Stripe API error.');
        case 'StripeConnectionError':
          // Some kind of error occurred during the HTTPS communication.
          throw new functions.https.HttpsError('internal', 'Stripe connection error.');
        case 'StripeAuthenticationError':
          // You probably used an incorrect API key.
          throw new functions.https.HttpsError('permission-denied', 'Stripe authentication error.');
        default:
          // Handle any other types of Stripe errors.
          throw new functions.https.HttpsError('internal', 'An unexpected Stripe error occurred.');
      }
    } else {
      // Handle non-Stripe errors.
      throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
    }
  }
});
