(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],[,,,,,,,,,function(e,t,n){e.exports=n(17)},,,,,function(e,t,n){},function(e,t,n){e.exports=n.p+"static/media/logo.5d5d9eef.svg"},function(e,t,n){},function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),r=n(8),o=n.n(r),s=(n(14),n(3)),c=n(2),l=n(1),u=n(5),h=n(4),d=(n(15),n(16),[]);d.blank="white",d.active="blue",d.pipe="red",d.split="black";var g=d,m=n(6),p="wss://secure-garden-92806.herokuapp.com/ws/sim",k=function(){function e(){Object(c.a)(this,e),this.callbacks={},this.socketRef=null}return Object(l.a)(e,null,[{key:"getInstance",value:function(){return e.instance||(e.instance=new e),e.instance}}]),Object(l.a)(e,[{key:"connect",value:function(){var e=this,t=p;this.socketRef=new WebSocket(t),this.socketRef.onmessage=function(t){console.log("Received"),e.socketNewMessage(t.data)},this.socketRef.onopen=function(){console.log("WebSocket open")},this.socketRef.onerror=function(e){console.log(e.message)},this.socketRef.onclose=function(){console.log("WebSocket closed, restarting.."),e.connect()}}},{key:"socketNewMessage",value:function(e){var t=JSON.parse(e),n=t.command;0!==Object.keys(this.callbacks).length&&("game"===n&&(console.log("game received"),this.callbacks[n](t)),"new_message"===n&&(console.log("okay so this was called"),this.callbacks[n](t.message)))}},{key:"initUser",value:function(e){this.sendMessage({command:"init",game_id:e})}},{key:"reset",value:function(e){this.sendMessage({command:"reset",game_id:e})}},{key:"blockClick",value:function(e,t,n){this.sendMessage({command:"block_click",game_id:e,i:t,j:n})}},{key:"directionClick",value:function(e,t,n){this.sendMessage({command:"direction_click",game_id:e,direction:t,pipe_size:n})}},{key:"changeSize",value:function(e,t,n,a){this.sendMessage({command:"change_size",game_id:e,i:t,j:n,pipe_size:a})}},{key:"deletePipe",value:function(e,t,n){this.sendMessage({command:"delete_pipe",game_id:e,i:t,j:n})}},{key:"changePressure",value:function(e,t){this.sendMessage({command:"change_init_pressure",game_id:e,initial_pressure:t})}},{key:"addCallbacks",value:function(e){this.callbacks.game=e}},{key:"sendMessage",value:function(e){try{console.log("tried"),console.log(Object(m.a)({},e)),this.socketRef.send(JSON.stringify(Object(m.a)({},e)))}catch(t){console.log(t.message)}}},{key:"state",value:function(){return this.socketRef.readyState}},{key:"waitForSocketConnection",value:function(e){var t=this.socketRef,n=this.waitForSocketConnection;setTimeout((function(){if(1===t.readyState)return console.log("Connection is made"),void(null!=e&&e());console.log("Wait for connection.."),n(e)}),1)}}]),e}();k.instance=null;var v=k.getInstance(),f=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(c.a)(this,n),(a=t.call(this,e)).gameIdChangeHandler=function(e){a.setState({game_id:e.target.value})},a.state={game_id:""},a}return Object(l.a)(n,[{key:"render",value:function(){var e=this;return i.a.createElement("div",{className:"login"},i.a.createElement("form",{onSubmit:function(t){return e.props.handleLogin(t,e.state.game_id)}},i.a.createElement("input",{type:"text",onChange:this.gameIdChangeHandler,value:this.state.game_id,placeholder:"Game Id",required:!0}),i.a.createElement("button",{className:"submit",type:"submit"},"Let's Go")))}}]),n}(i.a.Component),b=(i.a.Component,function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(){return Object(c.a)(this,n),t.apply(this,arguments)}return Object(l.a)(n,[{key:"render",value:function(){return i.a.createElement("button",{className:"square",style:{background:this.props.color},onClick:this.props.onClick,onContextMenu:this.props.onContextMenu},this.props.pressure)}}]),n}(i.a.Component)),C=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(){var e;Object(c.a)(this,n);for(var a=arguments.length,i=new Array(a),r=0;r<a;r++)i[r]=arguments[r];return(e=t.call.apply(t,[this].concat(i))).handleContextMenu=function(t,n,a){e.props.handleContextMenu(t,n,a)},e}return Object(l.a)(n,[{key:"renderBlock",value:function(e,t){var n=this,a=g[this.props.grid[e][t]],r=this.props.pressure[e][t];return i.a.createElement(b,{x:e,y:t,color:a,onClick:function(){return n.props.onClick(e,t)},onContextMenu:function(a){return n.handleContextMenu(a,e,t)},pressure:r})}},{key:"renderRow",value:function(e,t){for(var n=[],a=0;a<t;a++)n.push(this.renderBlock(e,a));return n}},{key:"renderGrid",value:function(e){for(var t=[],n=0;n<e;n++)t.push(i.a.createElement("div",{className:"board-row"},this.renderRow(n,e)));return t}},{key:"render",value:function(){var e=this.props.size;return i.a.createElement("div",null,this.renderGrid(e))}}]),n}(i.a.Component);function y(e){return i.a.createElement("button",{className:"direction",onClick:e.onClick},e.text)}function O(e){return i.a.createElement("button",{className:"blank"})}var j=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(){return Object(c.a)(this,n),t.apply(this,arguments)}return Object(l.a)(n,[{key:"renderDirection",value:function(e){var t=this;return i.a.createElement(y,{text:e,onClick:function(){return t.props.onClick(e)}})}},{key:"renderBlank",value:function(){return i.a.createElement(O,null)}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement("div",{className:"board-row"},this.renderBlank(),this.renderDirection("U"),this.renderBlank()),i.a.createElement("div",{className:"board-row"},this.renderDirection("L"),this.renderBlank(),this.renderDirection("R")),i.a.createElement("div",{className:"board-row"},this.renderBlank(),this.renderDirection("D"),this.renderBlank()))}}]),n}(i.a.Component);function E(e){return i.a.createElement("button",{className:"reset",onClick:e.onClick},"Reset")}var _=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(c.a)(this,n),(a=t.call(this,e)).handleChange=function(e){a.setState({selectedOption:e.target.value}),a.props.handleOptionChange(e)},a.state={selectedOption:"large"},a}return Object(l.a)(n,[{key:"render",value:function(){return i.a.createElement("form",null,i.a.createElement("input",{type:"radio",value:"small",checked:"small"==this.state.selectedOption,onChange:this.handleChange}),"0.5 inch",i.a.createElement("input",{type:"radio",value:"medium",checked:"medium"==this.state.selectedOption,onChange:this.handleChange}),"0.75 inch",i.a.createElement("input",{type:"radio",value:"large",checked:"large"==this.state.selectedOption,onChange:this.handleChange}),"1 inch")}}]),n}(i.a.Component),w=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(c.a)(this,n),(a=t.call(this,e)).state={initial_pressure:""},a.handleChange=a.handleChange.bind(Object(s.a)(a)),a}return Object(l.a)(n,[{key:"handleChange",value:function(e){this.setState({initial_pressure:e.target.value})}},{key:"render",value:function(){var e=this;return i.a.createElement("form",{onSubmit:function(t){return e.props.handlePressureChange(t,e.state.initial_pressure)}},"Enter initial pressure",i.a.createElement("input",{type:"text",onChange:this.handleChange}),i.a.createElement("button",{className:"submit",type:"submit"},"Make change"))}}]),n}(i.a.Component),S=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;Object(c.a)(this,n),(a=t.call(this,e)).handleLogin=function(e,t){e.preventDefault(),a.setState({game_id:t}),v.connect(),a.waitForSocketConnection((function(){v.initUser(t),v.addCallbacks(a.gameUpdate.bind(Object(s.a)(a)))}))},a.handleOptionChange=function(e){console.log(e.target.value),a.setState({pipe_size:e.target.value})},a.handleContextMenu=a.handleContextMenu.bind(Object(s.a)(a)),a.handleSizeChange=a.handleSizeChange.bind(Object(s.a)(a)),a.handleDeletePipe=a.handleDeletePipe.bind(Object(s.a)(a)),a.handlePressureChange=a.handlePressureChange.bind(Object(s.a)(a));for(var i=[],r=[],o=0;o<15;o++){var l=Array(15).fill("blank"),u=Array(15).fill("");r.push(u),i.push(l)}return r[14][0]="60",i[14][0]="active",a.state={size:15,grid:i,row:14,col:0,game_id:"",loggedIn:!1,pipe_size:"large",menuX:"100px",menuY:"100px",visible:!1,currBlockX:0,currBlockY:0,pressure:r,initial_pressure:"60"},a}return Object(l.a)(n,[{key:"componentDidMount",value:function(){var e=this;document.addEventListener("click",(function(t){e.setState({visible:!1})}))}},{key:"waitForSocketConnection",value:function(e){var t=this;setTimeout((function(){if(1===v.state())return console.log("Connection is made"),void e();console.log("Waiting for connection.."),t.waitForSocketConnection(e)}),100)}},{key:"handleDirectionClick",value:function(e){var t=this.state.game_id,n=this.state.pipe_size;v.directionClick(t,e,n)}},{key:"handleBlockClick",value:function(e,t){var n=this.state.game_id;v.blockClick(n,e,t)}},{key:"handleReset",value:function(){console.log("reset"),v.reset(this.state.game_id)}},{key:"gameUpdate",value:function(e){console.log("update");var t=e.grid,n=e.row,a=e.col,i=(e.size,e.pressure),r=e.initial_pressure;this.setState({loggedIn:!0,grid:t,row:n,col:a,pressure:i,initial_pressure:r})}},{key:"handleContextMenu",value:function(e,t,n){"pipe"==this.state.grid[t][n].split("_")[0]&&(e.preventDefault(),console.log(e.clientX,e.clientY),console.log(t,n),this.setState({menuX:e.clientX,menuY:e.clientY,visible:!0,currBlockX:t,currBlockY:n}))}},{key:"handleDeletePipe",value:function(e){var t=this.state.game_id,n=this.state.currBlockX,a=this.state.currBlockY;v.deletePipe(t,n,a)}},{key:"handleSizeChange",value:function(e){var t=e.target.value,n=this.state.game_id,a=this.state.currBlockX,i=this.state.currBlockY;v.changeSize(n,a,i,t)}},{key:"handlePressureChange",value:function(e,t){e.preventDefault();var n=this.state.game_id,a=+t;Number.isInteger(a)&&a>0?v.changePressure(n,a):alert("Enter a positive integer")}},{key:"render",value:function(){var e=this,t=this.state.size,n=this.state.grid,a=this.state.loggedIn,r=this.state.pressure;return a?i.a.createElement("div",null,i.a.createElement(C,{size:t,grid:n,onClick:function(t,n){return e.handleBlockClick(t,n)},handleContextMenu:this.handleContextMenu,pressure:r}),i.a.createElement(j,{onClick:function(t){return e.handleDirectionClick(t)}}),i.a.createElement(_,{handleOptionChange:this.handleOptionChange,selectedOption:this.state.pipe_size}),i.a.createElement(w,{handlePressureChange:this.handlePressureChange}),i.a.createElement(E,{onClick:function(){return e.handleReset()}}),this.state.visible&&i.a.createElement("div",{style:{position:"absolute",top:this.state.menuY,left:this.state.menuX}},i.a.createElement("button",{onClick:this.handleDeletePipe,value:"del"},"Delete pipe"),i.a.createElement("button",{onClick:this.handleSizeChange,value:"large"},"Change to 1 inch"),i.a.createElement("button",{onClick:this.handleSizeChange,value:"medium"},"Change to 0.75 inch"),i.a.createElement("button",{onClick:this.handleSizeChange,value:"small"},"Change to 0.5 inch"))):i.a.createElement(f,{handleLogin:this.handleLogin})}}]),n}(i.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(i.a.createElement(i.a.StrictMode,null,i.a.createElement(S,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[9,1,2]]]);
//# sourceMappingURL=main.bffdb8b3.chunk.js.map