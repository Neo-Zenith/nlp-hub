# nlp-hub

Change Log
[1] User authentication & access control implementation changed from middleware-level to guard-level for more flexible route management
[2] Port certain middlewares to interceptor level following authentication change [1] as request payload is now only populated at guard-level.
[3] Unique constraint now uses Mongoose's inbuilt composite unique index feature instead of triggers to account for race conditions.
[4] Map endpoints to the correct HTTP methods to conform to RESTful design.
[5] Restrucutred endpoints to comform to RESTful design.
[6] Added a layer of obscurity by encrypting userID and role before signing the access token.
[7] Stripped usage of database objectID in resource retrieval, update and removal
[8] Substitute usage ID as uuid before returning to client