import React from 'react';
import logo from './logo.svg';
import './App.css';
import Colors from './colors';
import WebSocketInstance from './WebSocket';

class LoginComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      game_id : '',
      budget : '',
      grid_size: 'mid',
    }

  }

  gameIdChangeHandler = (event) => {
    //console.log(window.location.origin.replace(/^http/,'ws')+'/ws/sim')
    this.setState({
      game_id: event.target.value
    });
  }

  budgetChangeHandler = (event) => {
    this.setState({
      budget: event.target.value
    });
    //console.log(this.state.budget)
  }

  sizeChangeHandler = (event) => {
    this.setState({
      grid_size: event.target.value
    });
  }

  render() {
    return(
      <div className="login">
        <form onSubmit={(e) => this.props.handleLogin(e, this.state.game_id, this.state.budget, this.state.grid_size)}>
          Enter an ID for your Game: <input 
            type="text"
            onChange = {this.gameIdChangeHandler}
            value = {this.state.game_id}
            placeholder = "Game Id"
            required 
          />
          Enter your budget<input
            type="number"
            onChange = {this.budgetChangeHandler}
            value = {this.state.budget}
            min = "0"
            step = "1"
            required
          /> 
          Large
          <input type="radio" checked = {this.state.grid_size=="large"} value = "large" onChange = {this.sizeChangeHandler} />
          Medium
          <input type="radio" checked = {this.state.grid_size=="mid"} value = "mid" onChange = {this.sizeChangeHandler} />
          Small
          <input type="radio" checked = {this.state.grid_size=="small"} value = "small" onChange = {this.sizeChangeHandler} />
          <button className="submit" type="submit">
            Let's Go
          </button>
        </form>
      </div>
    );
  }


}

class CustomContext extends React.Component{
 constructor(props) {
 super(props);
 
 this.state={
 visible: false,
 x: 0,
 y: 0
 };
 }
 
 componentDidMount(){
 var self=this;
 document.addEventListener('contextmenu', function(event){
 event.preventDefault();
 const clickX = event.clientX;
 const clickY = event.clientY;
 self.setState({ visible: true, x: clickX, y: clickY });
 
 });
 document.addEventListener('click', function(event){
 event.preventDefault();
 self.setState({ visible: false, x:0, y:0});
 
 });
 }
 
 returnMenu(items){
 var myStyle = {
 'position': 'absolute',
 'top': `${this.state.y}px`,
 'left':`${this.state.x+5}px`
 }
 
 return <div className='custom-context' id='text' style={myStyle}>
 {items.map((item, index, arr) =>{
 if(arr.length-1==index){
 return <div key={index} className='custom-context-item-last'>{item.label}</div>
 }else{
 return <div key={index} className='custom-context-item'>{item.label}</div>
 }
 })}
 </div>;
 }
   render() {
    return  (<div id='cmenu'>
        {this.state.visible ? this.returnMenu(this.props.items): null}
    </div>
    )
  }
}

class Block extends React.Component{
  render(){
  return (
    <button className="square" style={{background:this.props.color}} onClick={this.props.onClick} onContextMenu={this.props.onContextMenu}>
    {this.props.pressure}
    </button>
  )
  }
}

class Grid extends React.Component{

  renderBlock(i,j){
  	//console.log(this.props.grid[i][j])
    let color = Colors[this.props.grid[i][j]]
    let pressure = this.props.pressure[i][j];
    return <Block
      x={i}
      y={j}
      color={color}
      onClick={() => this.props.onClick(i,j)}
      onContextMenu={(e) => this.handleContextMenu(e,i,j)}
      pressure = {pressure}
    />
  }

  handleContextMenu = (e,i,j) => {
    this.props.handleContextMenu(e,i,j)
  }

  renderRow(i,n){
    let row = []
    for(let j = 0; j<n; j++){
      row.push(this.renderBlock(i,j));
    }
    return row;
  }

  renderGrid(n){
    let grid = []
    for(let i=0; i<n; i++){
      grid.push(<div className="board-row">{this.renderRow(i,n)}</div>);
    }
    return grid;
  }

  render(){
    const n = this.props.size;
    return(
      <div className="gridx">
        {this.renderGrid(n)}
      </div>
    )
  }
}

function Direction(props){
  return(
    <button className="direction" onClick={props.onClick}>
      {props.text}
    </button>
  )
}

function Blank(props){
  return(
    <button className="blank">
    </button>
  )
}



class Controls extends React.Component{

  renderDirection(text){
    return <Direction
      text={text}
      onClick={() => this.props.onClick(text)}
    />;
  }
  renderBlank(){
    return <Blank />;
  }

  render() {
    return(
      <div className="controls">
        <h1><p>Pipe Direction</p></h1>
        <div className="board-row">
          {this.renderBlank()}
          {this.renderDirection("Up")}
          {this.renderBlank()}
        </div>
        <div className="board-row">
          {this.renderDirection("Left")}
          {this.renderBlank()}
          {this.renderDirection("Right")}
        </div>
        <div className="board-row">
          {this.renderBlank()}
          {this.renderDirection("Down")}
          {this.renderBlank()}
        </div>
      </div>
    )
  }
}

function Reset(props){
  return(
    <div className="resetdiv">
    <button className="reset" onClick={props.onClick}>
      Reset
    </button>
    </div>
  )
}

class SelectPipe extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			selectedOption: 'large'
		}
	}

	handleChange = (e) => {
		this.setState({
			selectedOption: e.target.value
		})
		this.props.handleOptionChange(e);
		
	}

	render() {
		return(
    <div className="gen">
		<form>
      <h1>Pipe Size</h1>
      <label for="small">
			<input id="small" type="radio" value="small" checked = {this.state.selectedOption=="small"} onChange = {this.handleChange} />
      0.5 inch
			</label>
			<label for = "medium">   
			<input id="medium" type="radio" value="medium" checked = {this.state.selectedOption=="medium"} onChange = {this.handleChange} />
      0.75 inch
		  </label>
      <label for="large">
			<input id="large" type="radio" value="large" checked = {this.state.selectedOption=="large"} onChange = {this.handleChange} />
      1 inch
      </label>
			
		</form>
    </div>
		)
	}
}

class ChangeInitialPressure extends React.Component{
  
  constructor(props) {
    super(props)
    this.state = {
      initial_pressure: ''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    this.setState({
      initial_pressure: e.target.value
    });
  }

  render() {
    return(
      <form onSubmit={(e) => this.props.handlePressureChange(e,this.state.initial_pressure)}>
        <h1>Change Initial Pressure</h1>
        <input type="text" onChange = {this.handleChange} />        
        <button className="submit" type="submit">
        Make change
        </button>
      </form>
    )
  }
}

class App extends React.Component{

  constructor(props) {
    super(props);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleSizeChange = this.handleSizeChange.bind(this);
    this.handleDeletePipe = this.handleDeletePipe.bind(this);
    this.handlePressureChange = this.handlePressureChange.bind(this);
    let size = 22
    let grid = []
    let row = size-1
    let col = 0
    let pressure = []
    for(let i=0;i<size;i++){
      let row = Array(size).fill("blank")
      let prow = Array(size).fill("")
      pressure.push(prow)
      grid.push(row)
    }
    pressure[row][col] = "60"
    grid[row][col] = "active"
    this.state = {
      size:size,
      grid: grid,
      row: row,
      col: col,
      game_id: '',
      loggedIn: false,
      pipe_size: 'large',
      menuX: "100px",
      menuY: "100px",
      visible: false,
      currBlockX: 0,
      currBlockY: 0,
      pressure: pressure,
      initial_pressure: '60',
      cost: 0,
      budget: 0,
    };
   
  }
  componentDidMount(){
    var self = this
    document.addEventListener('click', function(event){
      self.setState({visible: false});
    });
  }
    waitForSocketConnection(callback) {
        const component = this;
        setTimeout(
            function(){
                if(WebSocketInstance.state() === 1){
                    console.log('Connection is made');
                    callback()
                    return;
                }
                else{
                    console.log("Waiting for connection..");
                    component.waitForSocketConnection(callback);
                }
            }, 100);
    }

  handleDirectionClick(direction) {
    let game_id = this.state.game_id
    let pipe_size = this.state.pipe_size
    WebSocketInstance.directionClick(game_id,direction,pipe_size)
  }

  handleBlockClick(i,j){
    let game_id = this.state.game_id
    WebSocketInstance.blockClick(game_id,i,j)
  }

  handleReset(){
    console.log("reset")
    WebSocketInstance.reset(this.state.game_id)
  }

  handleLogin = (e,game_id,budget,grid_size) => {
    e.preventDefault();
    this.setState({
      //loggedIn: true,
      game_id: game_id,
      budget: budget
    })
    console.log(budget)
    WebSocketInstance.connect();
    this.waitForSocketConnection(() => { 
      WebSocketInstance.initUser(game_id,budget,grid_size);
      WebSocketInstance.addCallbacks(this.gameUpdate.bind(this))
    });
  }

  handleOptionChange = (event) => {
  	//event.preventDefault();
  	console.log(event.target.value)
  	this.setState({
  		pipe_size: event.target.value
  	})
  }

  gameUpdate(parsedData){
    console.log('update')
    const grid = parsedData['grid']
    const row = parsedData['row']
    const col = parsedData['col']
    const size = parsedData['size']
    const pressure = parsedData['pressure']
    const initial_pressure = parsedData['initial_pressure']
    const cost = parsedData['cost']
    const budget = parsedData['budget']
    this.setState({
    	loggedIn: true,
      grid: grid,
      row: row,
      col: col,
      pressure: pressure,
      initial_pressure: initial_pressure,
      cost: cost,
      budget: budget,
      size: size,
    })
    
  }

  handleContextMenu(e,i,j){
    const grid = this.state.grid;
    if(grid[i][j].split("_")[0]=="pipe"){
      e.preventDefault()
      console.log(e.clientX,e.clientY)
      console.log(i,j)
      this.setState({
        menuX: e.clientX,
        menuY: e.clientY,
        visible: true,
        currBlockX: i,
        currBlockY: j,
      })
    }
  }

  handleDeletePipe(e) {
    let game_id = this.state.game_id
    let i = this.state.currBlockX
    let j = this.state.currBlockY
    WebSocketInstance.deletePipe(game_id,i,j)
  }

  handleSizeChange(event) {
    let size = event.target.value
    let game_id = this.state.game_id
    let i = this.state.currBlockX
    let j = this.state.currBlockY
    WebSocketInstance.changeSize(game_id,i,j,size);
  }

  handlePressureChange(event,val){
    event.preventDefault()
    let game_id = this.state.game_id
    let initial_pressure = +val
    if(Number.isInteger(initial_pressure)&&initial_pressure>0){
      WebSocketInstance.changePressure(game_id,initial_pressure)
    }
    else{
      alert('Enter a positive integer')
    }
  }

  render() {
    const size = this.state.size
    const grid = this.state.grid
    const loggedIn = this.state.loggedIn
    const pressure = this.state.pressure
    const cost = this.state.cost
    const budget = this.state.budget
    const color = budget>=cost ? "green" : "red"
    console.log(grid[size-1][1])
    return(
       loggedIn ?
      <div className = 'rowC '>

        
        <div className='grid'>
          <Grid 
            size={size}
            grid={grid}
            onClick = {(i,j) => this.handleBlockClick(i,j)}
            handleContextMenu = {this.handleContextMenu}
            pressure = {pressure}
          />
        </div>
        <div className='lhs'>       
          <div>
            <h1>Add a Pipe</h1>
            <Controls
              onClick = {(direction) => this.handleDirectionClick(direction)}
            />
            <SelectPipe
            	handleOptionChange = {this.handleOptionChange}
            	selectedOption = {this.state.pipe_size}
            />
          
            <ChangeInitialPressure 
              handlePressureChange = {this.handlePressureChange} />
            <Reset
              onClick = {() => this.handleReset()}
            />
          </div>
          <div>
            <h1>Budget</h1>
            <h2>{budget}</h2>
            <h1>Money Spent</h1>
            <h2><p style={{color:color}}>{cost}</p></h2>
            <h1>Money Remaining</h1>
            <h2><p style={{color:color}}>{budget-cost}</p></h2>
          </div>
        </div>

        {this.state.visible &&
          <div style={{position:"absolute", top:this.state.menuY, left:this.state.menuX}}>

            <button onClick={this.handleDeletePipe} value="del">
            Delete pipe
            </button>
            <button onClick={this.handleSizeChange} value="large">
            Change to 1 inch
            </button>
            <button onClick={this.handleSizeChange} value="medium">
            Change to 0.75 inch
            </button>
            <button onClick={this.handleSizeChange} value="small">
            Change to 0.5 inch
            </button>
            </div>
        }


      </div>
            :
      <LoginComponent
        handleLogin = {this.handleLogin} />
    )
  }
}

export default App;
