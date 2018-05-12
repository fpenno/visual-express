#!/bin/bash -x

# acronyms:
# CSR (Certificate Signing Request)
# RSA (Rivest, Shamir, and Adelman; the inventors of RSA algorithm)
# CRT (Certificate) to load in Node.js

# generate your private key and public certificate.
# answer the questions and enter the Common Name when prompted.
openssl req -newkey rsa:2048 -nodes -keyout private.rsa -x509 -days 365 -out certificate.pem

# review the created certificate:
openssl x509 -text -noout -in certificate.pem

# combine your key and certificate in a PKCS#12 (P12) bundle:
# export password: localhost
openssl pkcs12 -inkey private.rsa -in certificate.pem -export -out certificate.p12

# validate your P2 file:
# import password: localhost
openssl pkcs12 -in certificate.p12 -noout -info
