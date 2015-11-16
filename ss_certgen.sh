#!/usr/bin/env bash

OUT=.tmp;
CERT=server.crt
KEY=server.key
CSR=server.csr;

# Complexity
CMP=2048

# Valid
DAYS=365

# Cleans up any old runs
function init {
  clean;
  [[ -f $CERT ]] && rm "$CERT";
  [[ -f $KEY ]] && rm "$KEY";
  mkdir $OUT;
}

# Generates a private key
function gen_pk {
  openssl genrsa -des3 -out $OUT/$KEY $CMP;
}

# Generates a Certificate Signing Request
function gen_csr {
  openssl req -new -key $OUT/$KEY -out $OUT/$CSR;
}

# Remove pass-prompt from key
function strip_pass {
  cp $OUT/$KEY $OUT/$KEY.org;
  openssl rsa -in $OUT/$KEY.org -out $OUT/$KEY;
}

# Generate cert
function gen_cert {
  openssl x509 -req -days $DAYS -in $OUT/$CSR -signkey $OUT/$KEY -out $OUT/$CERT;
}

# Copies the completed cert up
function cpup {
  cp $OUT/$KEY $OUT/$CERT .;
}

# Cleans up this run
function clean {
  rm -rfv $OUT;
}

## Main
   init \
&& gen_pk \
&& gen_csr \
&& strip_pass \
&& gen_cert \
&& cpup \
&& clean;