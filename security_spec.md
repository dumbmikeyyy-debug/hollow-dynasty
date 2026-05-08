# Security Spec - The Hollow Dynasty

## Data Invariants
- A product must have at least one image and a positive price/stock.
- An order must have a valid customer object with all required fields.
- Total amount of an order must match the sum of items' prices * quantities.
- Only the user `dumb.mikeyyy@gmail.com` can access the admin panel and perform CRUD on products/orders.
- Orders are immutable by customers once created (customers can only create).

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a product as a regular user.
2. **Identity Spoofing**: Attempt to read all orders as a regular user.
3. **Identity Spoofing**: Attempt to update an order status as a regular user.
4. **State Shortcutting**: Attempt to update order status directly to 'delivered' as a customer.
5. **Resource Poisoning**: Create a product with a 1MB description string.
6. **Resource Poisoning**: Create a product with invalid ID (junk characters).
7. **Shadow Update**: Update a product with a `discountPrice` field that is actually a boolean.
8. **Shadow Update**: Add an `isVerified: true` field to an order via a client update.
9. **Unverified Auth**: Attempt to create an order with an unverified email account.
10. **Pincode Injection**: Send a 100-character string as a pincode.
11. **Price Manipulation**: Create an order where the `total` is 1 INR but the items are worth 10000 INR.
12. **Admin Spoofing**: Create an account with email `dumb.mikeyyy@gmail.com` but `email_verified: false` and try to access admin tools.

## The Test Runner
(I will implement the rules to block these)
