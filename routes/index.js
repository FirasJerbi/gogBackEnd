var express = require('express');
var router = express.Router();
var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Going out games' });
});

module.exports = router;



/* Login Services */

router.post('/gogames/fbgooglelogin', function(req,res,next){
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
						
						"user_email" : reqObj.email,
						"user_login" :reqObj.nicename,
						"user_nicename" :reqObj.nicename,
						
						"user_registered" : new Date()
						};
						var query = conn.query(insertSql, insertValues, function (err, result){
							if(err){
							console.error('SQL error: ', err);
							return next(err);
							}
							console.log(result);
							
							res.json({"userId":result.insertId});
						});

					}else {
						var y=rows[0];
						res.json({"userId":y['ID']});
					}
				});
				
			}
			});
		}
	catch(ex){
	console.error("Internal error:"+ex);
	return next(ex);
	}
});



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
							
							var y=rows[0];
							if(reqObj.pass==y['user_pass']){
								
								res.json({ "resultId" : -1 , "userId" : y['id'] });
							}
							else{
								res.json({"resultId":-2});
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
				var insertSql = "INSERT INTO wp_em_events SET ?";
				var insertValues = {
				"event_name" : reqObj.event_name,
				"event_owner" : reqObj.event_owner,
				"event_start_time" : reqObj.event_start_time,
				"event_start_date" : reqObj.event_start_date,
				"event_end_time" : reqObj.event_end_time,
				"event_end_date" : reqObj.event_end_date,
				"event_date_created": reqObj.event_date_created,
				"post_id" : 1000,
				"event_status" : 1
				};
				var query = conn.query(insertSql, insertValues, function (err, result){
					if(err){
					console.error('SQL error: ', err);
					return next(err);
					}else{
							var insertLocation = "INSERT INTO wp_gog_event_locations SET ?";
								var insertVals ={
									"event_id":result.insertId,
									"latitude":reqObj.latitude,
									"longitude" : reqObj.longitude,
									"country" : reqObj.country,
									"city": reqObj.city,
									"name":reqObj.name,
									"address":reqObj.address
								}
								conn.query(insertLocation,insertVals,function(err,result){
									if(err){
										console.error('Location insertion error: ', err);
									return next(err);
									}else{
										locationId=result.insertId;
										res.json({"insertId":result.insertId});
									}
								});
						}
				
				});	

			
			}
			});

	}catch(ex){
        console.error("Internal error:" + ex);
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
                conn.query('select G.name, G.longitude, G.latitude, U.user_nicename,E.event_name, E.event_start_date, E.event_start_time, E.event_end_date,E.event_end_time from wp_em_events E, wp_users U,wp_gog_event_locations G where E.event_owner=U.ID and G.event_id= E.event_id and (E.event_end_date>Date(now()) or (E.event_end_date=Date(now()) and E.event_end_time>time(now()))) and G.city=? and G.country=?', [city,country] , function(err, rows, fields) {
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
