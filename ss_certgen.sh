if [[ uname == *"MINGW"* ]]
then
    openssl req \
        -new \
        -newkey rsa:2048 \
        -days 365 \
        -nodes \
        -x509 \
        -subj "//CN=localhost" \
        -keyout server.key \
        -out server.crt
else
    openssl req \
        -new \
        -newkey rsa:2048 \
        -days 365 \
        -nodes \
        -x509 \
        -subj "/CN=localhost" \
        -keyout server.key \
        -out server.crt
fi