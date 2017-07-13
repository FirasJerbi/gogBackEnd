var express = require('express');
var router = express.Router();
var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Going out games' });
});

module.exports = router;

/* Login Services */
router.post('/gogames/login',function(req,res,next){
	try{
		var reqObj = req.body;
		mess=0;
		console.log("this is the req object ",reqObj);
		req.getConnection(function(err,conn){
			if(err){
				console.error('SQL Connection error: ', err);
				return next(err);
			}
			else
			{
				conn.query("select user_email, user_pass,id from wp_users where user_email=?",[reqObj.email],function(err,rows,fields){
					if(err){
						console.error('SQL error: ', err);
						return next(err);
					}
					else{
						var x=0;
						for(var i in rows)x++;
						if (x>0){
							mess=-1;
							var y=rows[0];
							if(reqObj.pass==y['user_pass']){
								mess=-2;
								res.json({ message : mess , insertId : y['id'] });
							}
							else{
								res.json({"resultId":mess});
							}
							
							
						}
						else res.json({"resultId":-3});

					}
				});
			}
		});

	}catch(ex){
	console.error("Internal error:"+ex);
	return next(ex);
	}
});

router.post('/gogames/addUser', function(req,res,next){
	try{
		var reqObj = req.body;
			
		req.getConnection(function(err, conn){
			if(err)
			{
				console.error('SQL Connection error: ', err);
				return next(err);
			}
			else
			{
				conn.query("select * from wp_users where user_email = ?",[reqObj.email], function(err, rows, fields) {
					if(err){
						console.error('SQL error: ', err);
						return next(err);
					}
					var check=0;
					for(var evtIndex in rows) check++;
					console.log("check result", check);
					if (check==0){
						var insertSql = "INSERT INTO wp_users SET ?";
						var insertValues = {
						"user_login" : reqObj.login,
						"user_pass" : reqObj.pass,
						"user_nicename" : reqObj.nicename,
						"user_email" : reqObj.email,
						"display_name" :reqObj.nicename,
						"user_registered" : new Date()
						};
						var query = conn.query(insertSql, insertValues, function (err, result){
							if(err){
							console.error('SQL error: ', err);
							return next(err);
							}
							console.log(result);
							
							res.json({'exist':true,"insertId":result.insertId});
						});

					}else res.json({'exist':false});
				});
				
			}
			});
		}
	catch(ex){
	console.error("Internal error:"+ex);
	return next(ex);
	}
});

/* POST events Service*/


router.post('/gogames/createEvent',function(req,res,next){
	try{
		var reqObj=req.body;
		req.getConnection(function(err, conn){
			if(err)
			{
				console.error('SQL Connection error: ', err);
				return next(err);
			}
			else
			{	

				
				var req1=conn.query("select location_id from wp_em_locations where location_town=? and location_country=?",[reqObj.event_city,reqObj.event_country],function(err, rows, fields) {
					if(err){
						console.error('SQL error: ', err);
                        return next(err);
					}else{
						var x=0;
						for( var i in rows)x++;
						if(x>0){
							var y=rows[0];
							var locationId=y['location_id'];
							console.log("location id update in select", locationId);
							insertEvent(reqObj,locationId,conn,res);
							
						}else{
							var insertLocation = "INSERT INTO wp_em_locations SET ?";
								var insertVals ={
									"location_town":reqObj.event_city,
									"post_id" : 1000,
									"location_country":reqObj.event_country
								}
								conn.query(insertLocation,insertVals,function(err,result){
									if(err){
										console.error('Location insertion error: ', err);
									return next(err);
									}else{
										locationId=result.insertId;
										console.log("location id update in insert",locationId);
										insertEvent(reqObj,locationId,conn,res);
									}
								});
						}
					}
				});


			
			}
			});

	}catch(ex){
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

function insertEvent(reqObj,locationId, conn,res){
		console.log("location id update after",locationId);
		var insertSql = "INSERT INTO wp_em_events SET ?";
		var insertValues = {
		"event_name" : reqObj.event_name,
		"event_owner" : reqObj.event_owner,
		"event_start_time" : reqObj.event_start_time,
		"event_start_date" : reqObj.event_start_date,
		"location_id": locationId,
		"post_id" : 1000,
		"event_status" : 1
		};
		var query = conn.query(insertSql, insertValues, function (err, result){
			if(err){
			console.error('SQL error: ', err);
			return next(err);
			}
			console.log(result);
			res.json({"insertId":reqObj.insertId});
		});	
}

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
