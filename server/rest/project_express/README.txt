README

START DB
mongod --dbpath /Users/pro001/Desktop/Dev/Learning/tests/server/rest/project/data


START SERVER APP
/Users/pro001/Desktop/Dev/Learning/tests/server/rest/project


LOG FILE Setups
http://stackoverflow.com/questions/26650242/recommended-way-of-applying-bunyan-to-a-large-node-application?rq=1

EC2

	SETUP NODEJS
	http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.sdlc.html

	Install EB tool
	http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html

	COMMANDS
	ssh -i ~/.aws/keypairs/test/keypair1.pem ec2-user@ec2-52-26-228-69.us-west-2.compute.amazonaws.com -v

	testuser S&9YesH5029d

	ROLLING DEPLOYMENT
	http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html

	/var/log/eb-cfn-init.log


bcrypt
http://stackoverflow.com/questions/29320201/error-installing-bcrypt-with-npm