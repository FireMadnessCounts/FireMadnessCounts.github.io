var baseURL = "";

/* */
//if (typeof isEmbed == 'undefined')
//    isEmbed = 0;

/* */
//if (window.location.hostname.indexOf("") < 0) {
//    if (window.location.protocol != "")
//        window.location.replace("https:" + window.location.href.substring(window.location.protocol.length));
//
//    if (location.hostname.indexOf("youtuberealtime.netlify.com") == -1)
//       window.location.replace(baseURL + location.hash);
//
//    if ((window.top !== window.self) && isEmbed == 0)
//        window.top.location.replace(window.self.location.href);
//
//    if ((window.top == window.self) && isEmbed)
//        window.top.location.replace(baseURL + location.hash);
//}

/* */
//Array.prototype.shuffle = function () {
//    var i = this.length,
//        j, temp;
//    if (i == 0) return this;
//    while (--i) {
//        j = Math.floor(Math.random() * (i + 1));
//        temp = this[i]; 
//        this[i] = this[j];
//        this[j] = temp;
//    }
//    return this;
//};

/* */
var YT = {};

/* */
YT.updateManager = {

    /* */
    prepare: function (e) {
        var odEl = ["#yt_subs"];
        if (!isEmbed) {
            odEl = odEl.concat(["#yt_views", "#yt_videos", "#yt_comments"]);
        }
        odEl.forEach(function (e) {
            new Odometer({
                el: document.querySelector(e),
                value: "0",
                format: '(,ddd)',
                theme: 'minimal'
            });
        });
    },

    /* */
    updateName: function (e) {
        $("#yt_name").text(e);
    },

    /* */
    updateProfile: function (e) {
        $("#yt_profile").attr("src", e);
    },

    /* */
    updateCover: function (e) {
        $("#yt_cover").attr("src", e);
    },

    /* */
    updateSubscribers: function (e) {
        $("#yt_subs").text(e);
    },

    /* */
    updateViews: function (e) {
        $("#yt_views").text(e);
    },

    /* */
    updateVideos: function (e) {
        $("#yt_videos").text(e);
    },

    /* */
    updateComments: function (e) {
        $("#yt_comments").text(e);
    },

    /* */
    updateChannelID: function (e) {
        YT.live.channelID = e;
        $("#yt_shareurl").val(YT.urls.getCurrent());
        $("#yt_embed").val('<iframe height="80px" width="300px" frameborder="0" src="' + baseURL + 'embed/#!/' + YT.live.channelID + '" style="border: 0; width:300px; height:80px; background-color: #FFF;"></iframe>');
    }
};

/* */
YT.query = {
    newSearch: function (e) {
        if (e.trim() == YT.live.channelID || e.trim() == "") {
            return;
        }
        YT.live.stop();
        if (e.trim().substr(0, 2).toUpperCase() == "UC" && e.trim().length >= 24) {
            $.getJSON("https://api.livecounts.nl/api/yt/channel/" + encodeURIComponent(e), function (e) {
                YT.live.start();
                if (e) {
                } 
                var gsnippet = e.items[0];
                YT.updateManager.updateChannelID(gsnippet.snippet.id);
                YT.query.getCover(gsnippet.snippet.id);
                YT.updateManager.updateName(gsnippet.channel.title);
                YT.updateManager.updateProfile(gsnippet.pictures.avatar ? gsnippet.pictures.avatar : gsnippet.pictures.avatar);
                YT.urls.pushState(gsnippet.snippet.id);
            });
        } else {
            $.getJSON("https://mixerno.space/api/yt/search/channel/" + encodeURIComponent(e), function (e) {
                YT.live.start();
                if (e.pageInfo.totalResults < 1) {
                    alert("No results found!");
                    location.href = baseURL;
                    return;
                }
                var snippet = e.items[0].snippet;
                YT.updateManager.updateChannelID(snippet.channelId);
                YT.query.getCover(snippet.channelId);
                YT.updateManager.updateName(snippet.channelTitle);
                YT.updateManager.updateProfile(snippet.thumbnails.high.url ? snippet.thumbnails.high.url : snippet.thumbnails.default.url);
                YT.urls.pushState(snippet.channelId);
            });
        }
    },
    getCover: function (e) {
        $.getJSON("https://api.livecounts.nl/api/yt/channel/" + encodeURIComponent(e), function (e) {
            YT.updateManager.updateCover(e.items[0].snippet.avatar);
        });  
    },
    search: function (e) {
        e.preventDefault();
        YT.query.newSearch($("#yt_searchvalue").val());
        $("#yt_searchvalue").val("");

        /* @SERGIO */
        YT.updateManager.updateSubscribers(0);
    }
};

/* */
YT.live = {
    channelID: "",
    update: function () {
        $.getJSON("https://api.livecounts.nl/ytsubs/live/" + this.channelID,
            function (e) {
                if (e) {
                    YT.updateManager.updateSubscribers(e.items[0].statistics.subscriberCount);
                } else { 
                    YT.query.newSearch(YT.live.channelID);
                }
            });

        /*
        $.getJSON("https://api.jfrenlsubcounter.nl/api/stats/yt_channels/" + this.channelID, function (e) {
            document.title = e;
        });
         */
    },
    timer: null,
    start: function () {
        this.timer = setInterval(function (e) {
            YT.live.update();
        }, 3000);
    },
    stop: function () {
        clearInterval(this.timer);
    }
};

/* */
YT.sharing = {
    youtube: function () {
        window.open("https://www.youtube.com/channel/" + YT.live.channelID);
    },
    facebook:
        function () {
            window.open("https://www.facebook.com/dialog/feed?app_id=1473140929606808&display=page&caption=" + YT.sharing.getText() + "&link=" + YT.sharing.getEncodedURL() + "&redirect_uri=" + encodeURIComponent(baseURL + "assets/close.html"));
        },
    twitter: function () {
        window.open("https://twitter.com/intent/tweet?original_referer=" + YT.sharing.getEncodedURL() + "&ref_src=twsrc%5Etfw&text=" + YT.sharing.getText() + "&tw_p=tweetbutton&via=iakshatmittal&url=" + YT.sharing.getEncodedURL());
    },
    pin: function () {
        var obj = {
            name: $("#yt_name").text(),
            id: YT.live.channelID
        };
        YT.pins.addPin(obj);
    },
    getText: function () {
        return encodeURIComponent("Check out " + $("#yt_name").text() + "'s real time subscriber count on @YouTube!");
    },
    getEncodedURL: function () {
        return encodeURIComponent(YT.urls.getCurrent());
    },
    bind: function () {
        $("#yt_shareyt").on("click", this.youtube);
        $("#yt_sharetw").on("click", this.twitter);
        $("#yt_sharefb").on("click", this.facebook);
        $("#yt_sharefl").on("click", this.pin);
    }
};

/* */
YT.urls = {
    onchange: function () {
        var q = location.hash.split("!/")[1];
        if (q) {
            YT.query.newSearch(location.hash.split("!/")[1]);
        } else {
            var coolGuys = [
                'UCBJycsmduvYEL83R_U4JriQ',
                'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
                'UCq-Fj5jknLsUf-MWSy4_brA'
            ];

            /* */
            YT.query.newSearch(coolGuys[Math.floor(Math.random() * coolGuys.length)]);
        }
    },
    pushState: function (e) {
        history.pushState(null, null, "#!/" + e);
        YT.query.newSearch(e);
    },
    getCurrent: function () {
        return baseURL + "#!/" + YT.live.channelID;
    }
};

/* */
YT.pins = {
    getDefault: function () {
        return JSON.stringify([{
            name: "Google",
            id: "UCK8sQmJBp8GCxrOtXWBpyEA"
        }]);
    },
    getPins: function () {
        return JSON.parse(localStorage.getItem("pins") ? localStorage.getItem("pins") : this.getDefault());
    },
    setPins: function (e) {
        localStorage.setItem("pins", JSON.stringify(e));
        this.updateDOM();
    },
    updateDOM: function () {
        var pins = this.getPins();
        console.log(pins);
        var count = 0;
        $pn = $("#yt_pins");
        $pn.html("");
        pins.forEach(function (e) {
            $tr = $("<tr>");
            $tr.append($("<td>").text(++count));
            $tr.append($("<td>").text(e.name));
            $tr.append($("<td>", {
                onclick: "YT.pins.removePin('" + e.id + "')"
            }).append("<button class='btn btn-danger'><i class='fa fa-trash'></i> Remove</button>"));
            $pn.append($tr);
        });
        $pn = $("#pinned_nav");
        $pn.html("");
        $pn.append($('<li class="nav-small-cap">PINNED USERS</li>'));
        pins.forEach(function (e) {
            $li = $("<li>");
            $a = $("<a>", {
                class: "waves-effect waves-dark",
                href: "#!/" + e.id
            });
            $i = $("<i>", {
                class: "fa fa-user"
            });
            $a.append($i);
            $span = $("<span>", {
                class: "hide-menu"
            }).text(e.name);
            $a.append($span);
            $li.append($a);
            $pn.append($li);
        });
    },
    addPin: function (e) {
        var pins = this.getPins();
        if (pins.length >= 8) {
            alert("Pins Limit Reached! Try removing another pin before adding a new one.");
            return;
        }
        for (i = 0; i < pins.length; i++) {
            if (e.id == pins[i].id)
                return;
        }
        pins.push(e);
        this.setPins(pins);
    },
    removePin: function (e) {
        var pins = this.getPins();
        var tf = null;
        pins.forEach(function (r) {
            if (r.id == e) {
                tf = r;
            }
        });
        if (tf != null) pins.splice(pins.indexOf(tf), 1);
        this.setPins(pins);
    },
    resetPins: function () {
        YT.pins.setPins(JSON.parse(YT.pins.getDefault()));
    }
};

/* */
$(window).bind("popstate", YT.urls.onchange);

/* */
$(function () {
    YT.updateManager.prepare();
    YT.sharing.bind();
    YT.urls.onchange();
    YT.pins.updateDOM();
    $("#yt_pinsreset").on("click", YT.pins.resetPins);
    $("#yt_search").on("submit", YT.query.search);
    $("#yt_searchbutton").on("click", YT.query.search);

    // Meta
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', 'UA-1788655-15', 'auto');
    ga('send', 'pageview', {
        'page': location.pathname + location.search + location.hash,
        'title': document.title
    });
}); 