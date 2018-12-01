(function(window, document) {
	/* initially I had plans to animate the different sites, so started with svg. Perharps it's more performant to use canvas */
	var createSVG = function(width, height) {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.id = 'honeycomb';

			svg.setAttributeNS(null, 'width', width);
			svg.setAttributeNS(null, 'height', height);

			svg.style.width = width + 'px';
			svg.style.height = height + 'px';

		return svg;
	};

	/* a site is a point inside the diagram, here we create random coords for n amount of points  */
	var generateSites = function(numberOfSites, width, height) {
        var sites = [];
        for (var i=0; i<numberOfSites; i++) {
			sites.push({x:Math.round(Math.random() * width), y: Math.round(Math.random() * height)});
        }
        return sites;
    };

    /* draw each cell using a voronoi diagram */
	var drawCells = function(svg, diagram) {
		var cells = diagram.cells;

		if (!cells) { return; }

			var halfedges, nHalfedges, iHalfedge;
			var v;
			for (var cellid in cells) {
				halfedges = cells[cellid].halfedges;
				if (halfedges.length > 0) {

				nHalfedges = halfedges.length;

				v = halfedges[0].getStartpoint();

				var cellPath = 'M ' + parseInt(v.x, 10) + ' ' + parseInt(v.y, 10);

				for (iHalfedge=0; iHalfedge<nHalfedges; iHalfedge++) {
					v = halfedges[iHalfedge].getEndpoint();
					cellPath += ' L ' + parseInt(v.x, 10) + ' ' + parseInt(v.y, 10);
				}
				
				var cell = document.createElementNS('http://www.w3.org/2000/svg','path');
	  			cell.setAttributeNS(null, 'd', cellPath);
	  			cell.setAttributeNS(null, 'stroke', 'rgba(255,255,255, .01)');
	  			cell.setAttributeNS(null, 'stroke-width', 1);
	  			cell.setAttributeNS(null, 'fill', 'rgba(99,76,1, ' + Math.random() * .3 + ')');
	  			cell.setAttributeNS(null, 'id', 'cell' + cellid);

				svg.appendChild(cell);
  			}
		}
	};

	/* generate a voronoi diagram, svg and draw the cells */
	var createBackground = function() {
		var svgWidth = document.documentElement.clientWidth,
			svgHeight = document.documentElement.clientWidth,

			totalItems = parseInt((svgWidth * svgHeight * 0.00043402777777777775), 10),

			voronoi = new Voronoi(),
			svg = createSVG(svgWidth, svgHeight),

			sites = generateSites(totalItems, svgWidth, svgHeight),
			bbox = {xl:0, xr: svgWidth, yt:0, yb: svgHeight},

			diagram = voronoi.compute(sites, bbox);

		drawCells(svg, diagram);

		document.body.appendChild(svg);
    };

    var recreateBackground = function() {
    	var honeycomb = document.getElementById('honeycomb');
    	document.body.removeChild(honeycomb);

    	createBackground();
    };

    var init = function() {
    	createBackground();

	    var setEvent = function(element, eventName, eventFunction) {
            if (element.addEventListener) {
                element.addEventListener(eventName, eventFunction, false);
            } else if(element.attachEvent) {
                element.attachEvent('on' + eventName, eventFunction);
            } else {
                element['on' + eventName] = eventFunction;
            }
        };

        setEvent(window, 'resize', recreateBackground);
    };

	init();
})(window, document);