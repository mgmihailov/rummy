//var peer = new Peer('my-first-random-id', { host: '9000-cd18460a-8af3-4ff8-9473-76855642fc3a.ws-eu03.gitpod.io', path: '/', port: 9000 });
var peer = new Peer('my-second-random-id', { host: '9000-cd18460a-8af3-4ff8-9473-76855642fc3a.ws-eu03.gitpod.io', path: '/', port: 9000 });


peer.on('connection', function(conn) {
  conn.on('data', function(data){
    // Will print 'hi!'
    console.log(data);
  });
});


let el = document.createElement("button");
el.innerText = "Connect";
el.onclick = function(e) {
  let conn = peer.connect('my-first-random-id');
  //let conn = peer.connect('my-second-random-id');

  conn.on('open', function() {
    conn.send('heey there');
  });
}
document.body.appendChild(el);