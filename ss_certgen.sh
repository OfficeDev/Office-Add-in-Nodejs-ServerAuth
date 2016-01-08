SUBJ="/CN=localhost"

if [[ $(uname) == *"MINGW"* ]]
then
SUBJ="/$SUBJ"
fi

openssl req \
-new \
-newkey rsa:2048 \
-days 365 \
-nodes \
-x509 \
-subj $SUBJ \
-keyout server.key \
-out server.crt