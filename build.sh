browserify --standalone nexus-flux -t [ babelify ] -o dist/nexus-flux.js --extension='.js' --extension='.jsx' src/index.jsx --noparse='/home/franzp/lifespan/dist/lifespan.js' \
	--noparse='/home/franzp/remutable/dist/remutable.js' --noparse='/home/franzp/nexus-events/dist/nexus-events.js'
