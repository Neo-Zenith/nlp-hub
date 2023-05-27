# nlp-hub

Preventing NoSQL injection
1. From request body itself, fields with type string => attempts to pass in db query objects
    Countered by type-check middleware before route handling

2. From request body itself, fields with type object => attempts to pass in db query objects
    Countered by mongoose validation check enforcing "$" cannot be present in a map (record)

3. From request query itself, filters are redundantly checked to sanitize. By default they are already string