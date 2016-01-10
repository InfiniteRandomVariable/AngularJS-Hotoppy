
http://www.thegeekstuff.com/2009/07/linux-apache-mod-ssl-generate-key-csr-crt-file/
SHA 256 http://itigloo.com/security/generate-an-openssl-certificate-request-with-sha-256-signature/
http://stackoverflow.com/questions/4691699/how-to-convert-crt-to-pem

untest - maybe easier and faster
http://stackoverflow.com/questions/991758/how-to-get-an-openssl-pem-file-from-key-and-crt-files

untested
http://www.akadia.com/services/ssh_test_certificate.html

Using
http://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl
req -x509 -sha256 -nodes -newkey rsa:2084 -keyout key.pem -out cert.pem -days 3000


  644  openssl sha -sha256 -sign private.pem < data.txt
  645  openssl genrsa -out private.pem 1024
  646  ls
  647  openssl rsa -in private.pem -out public.pem -outform PEM -pubout