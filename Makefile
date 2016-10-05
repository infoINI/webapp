publish:
	gulp build
	rsync -rv --exclude='.git*' --delete ./build/ core@infoini.de:/srv/webapp/
