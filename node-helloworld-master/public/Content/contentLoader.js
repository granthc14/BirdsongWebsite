$.ajax({
    type: 'GET',
    url: '/get_movies',
    success: function(data){
        var movies = JSON.parse(data);
        var screenOne = movies["screenOne"];
        var screenTwo = movies["screenTwo"];
        var cs = movies["comingSoon"];
        var s1m1 = screenOne["movieOne"];
        var s1m2 = screenOne["movieTwo"];
        var s2m1 = screenTwo["movieOne"];
        var s2m2 = screenTwo["movieTwo"];


        $('m1S1Start').innerHTML = s1m1["startTime"];
        $('m1S1Link').attr('href',s1m1["imdbLink"]);
        $('guideImage').attr('src', s1m1["imgPath"]);

        $('m2S1StartTime').innerHTML = s1m2["startTime"];
        $('m2S1Link').attr('href',s1m2["imdbLink"]);
        $('m2S1Img').attr('src', s1m2["imgPath"]);

        $('S2M1Time').innerHTML = s2m1["startTime"];
        $('S2M1Link').attr('href',s2m1["imdbLink"]);
        $('S2M1Img').attr('src', s2m1["imgPath"]);

        $('S2M2Time').innerHTML = s2m2["startTime"];
        $('S2M2Link').attr('href',s2m2["imdbLink"]);
        $('S2M2Img').attr('src', s2m2["imgPath"]);


        if (cs != null) {
            if (cs["startTime"] != null) {
                $('CSTime').innerHTML = cs["startTime"];
            }

            if (cs["imdbLink"] != null) {
                $('CSLink').attr('href',cs["imdbLink"]);
            }

            if (cs["imgPath"]!= null) {
                $('fixImage').attr('src', cs["imgPath"]);
            }
        }




        console.log('success');
    },
    error: function(data) {
        console.log('error');
    }
});
