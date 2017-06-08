var express = require('express');
var router = express.Router();
var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Going out games' });
});

module.exports = router;

/* Create Event Service. */
router.post('/gogames/createEvent', function(req,res,next){
try{
	var reqObj = req.body;	
	console.log(reqObj);
	req.getConnection(function(err, conn){
		if(err)
		{
			console.error('SQL Connection error: ', err);
			return next(err);
		}
		else
		{
			var insertSql = "INSERT INTO wp_em_events SET ?";
			var insertValues = {
			"event_id" : reqObj.eventId,
			"event_slug" : reqObj.eventSlug,
			"event_owner" : reqObj.eventOwner
			};
			var query = conn.query(insertSql, insertValues, function (err, result){
				if(err){
				console.error('SQL error: ', err);
				return next(err);
				}
				console.log(result);
				var Employee_Id = result.insertId;
				res.json({"event_id":event_id});
			});
		}
		});
	}
	catch(ex){
	console.error("Internal error:"+ex);
	return next(ex);
	}
});

/* Get Events Service. */
router.get('/gogames/getEventsDetails', function(req, res, next) {
    try {
    	
  		var query = url.parse(req.url,true).query;
  		console.log(query);
        
        var locationId = query.locationId;
        var city=query.city;
        var country=query.country;
        console.log(country);
        req.getConnection(function(err, conn) {
            if (err) {
                console.error('SQL Connection error: ', err);
                return next(err);
            } else {
                conn.query('select U.user_nicename,E.event_name, E.event_start_date, E.event_start_time from wp_em_events E, wp_users U,wp_em_locations L  where E.event_owner=U.ID and E.location_id = L.location_id and L.location_town=? and L.location_country=?', [city,country] , function(err, rows, fields) {
                    if (err) {
                        console.error('SQL error: ', err);
                        return next(err);
                    }
                    var resEvt = [];
                    for (var evtIndex in rows) {
                        var evtObj = rows[evtIndex];
                        resEvt.push(evtObj);
                    }
                    res.json(resEvt);
                });
            }
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});
