System.register("chunks:///_virtual/main",["./Player.ts"],(function(){return{setters:[null],execute:function(){}}}));

System.register("chunks:///_virtual/Player.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(e){var t,i,o,n,r,l,a,s,y,u,_,c,d,p;return{setters:[function(e){t=e.applyDecoratedDescriptor,i=e.inheritsLoose,o=e.initializerDefineProperty,n=e.assertThisInitialized},function(e){r=e.cclegacy,l=e._decorator,a=e.Node,s=e.Collider,y=e.Label,u=e.input,_=e.Input,c=e.director,d=e.KeyCode,p=e.Component}],execute:function(){var h,f,P,v,b,g,C,K,M,N,E,T;r._RF.push({},"e1dc4bLPDRHaY3OgSsdoOQh","Player",void 0);var D=l.ccclass,m=l.property;e("Player",(h=D("Player"),f=m(a),P=m(s),v=m(a),b=m(y),h((K=t((C=function(e){function t(){for(var t,i=arguments.length,r=new Array(i),l=0;l<i;l++)r[l]=arguments[l];return t=e.call.apply(e,[this].concat(r))||this,o(t,"C_Node",K,n(t)),o(t,"Player_Node",M,n(t)),o(t,"Tips_Node",N,n(t)),o(t,"Tips_Label",E,n(t)),o(t,"Player_Speed",T,n(t)),t.Player_Move={a:!1,d:!1},t.Move=!0,t}i(t,e);var r=t.prototype;return r.onLoad=function(){u.on(_.EventType.KEY_DOWN,this.Key_Down,this),u.on(_.EventType.KEY_UP,this.Key_Up,this),this.Player_Node.on("onTriggerEnter",this.Start_Collider,this)},r.onDestroy=function(){u.off(_.EventType.KEY_DOWN,this.Key_Down,this),u.off(_.EventType.KEY_UP,this.Key_Up,this),this.Player_Node.off("onTriggerEnter",this.Start_Collider,this)},r.New_Game=function(){c.loadScene("scene")},r.Start_Collider=function(e){this.Move=!1,this.Tips_Node.active=!0,"Win"==e.otherCollider.node.name?this.Tips_Label.string="成功了":this.Tips_Label.string="失败了"},r.Key_Down=function(e){e.keyCode===d.KEY_A?(this.Player_Move.a=!0,console.log("按下了a")):e.keyCode===d.KEY_D&&(this.Player_Move.d=!0,console.log("按下了d"))},r.Key_Up=function(e){e.keyCode===d.KEY_A?(this.Player_Move.a=!1,console.log("抬起了a")):e.keyCode===d.KEY_D&&(this.Player_Move.d=!1,console.log("抬起了d"))},r.update=function(e){if(this.Move){var t=this.node.getPosition(),i=this.C_Node.getPosition(),o=.5*e*this.Player_Speed;this.Player_Move.a&&!this.Player_Move.d?t.x=t.x-o:this.Player_Move.d&&!this.Player_Move.a&&(t.x=t.x+o),t.x=Math.max(Math.min(t.x,3.2),-3.2),this.node.setPosition(t.x,t.y,t.z-o),this.C_Node.setPosition(i.x,i.y,i.z-o)}},t}(p)).prototype,"C_Node",[f],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),M=t(C.prototype,"Player_Node",[P],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),N=t(C.prototype,"Tips_Node",[v],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),E=t(C.prototype,"Tips_Label",[b],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),T=t(C.prototype,"Player_Speed",[m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return 30}}),g=C))||g));r._RF.pop()}}}));

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});