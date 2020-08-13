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
        <div className="login-title">
          <p>PlumbingSim</p>
        </div>
        <div className="login-form">
        <form onSubmit={(e) => this.props.handleLogin(e, this.state.game_id, this.state.budget, this.state.grid_size)}>
          <div className="login-comp">         
          Simulation ID<br /><div className="login-inputbox"><input 
            type="text"
            onChange = {this.gameIdChangeHandler}
            value = {this.state.game_id}
            placeholder = "Simulation Id"
            required 
            className="login-input"
          /></div>
          </div>
          <div className="login-comp">
          Budget <br /><div className="login-inputbox"><input
            type="number"
            onChange = {this.budgetChangeHandler}
            value = {this.state.budget}
            min = "0"
            step = "1"
            placeholder = "Budget"
            required
            className="login-input"
          /></div>
          </div>
          <div className="login-comp">
          Design boards:<br /> 

          <div className="size-options">          
          <input type="radio" checked = {this.state.grid_size=="mid"} value = "mid" onChange = {this.sizeChangeHandler} />
          Explore
          </div>

          <div className="size-options">         
          <input type="radio" checked = {this.state.grid_size=="sub_opt"} value = "sub_opt" onChange = {this.sizeChangeHandler} />
          Sub Optimal Model
          </div>

          </div>
          <div className="login-submit">
          <button className="submit" type="submit" className="login-submit-button">
          Start
          </button>
          
          </div>

        </form>
        </div>
        <div className="log">
        <a href="/sim/log">View Logs</a>
        </div>
      </div>
    );
  }


}


class Block extends React.Component{
  render(){

  return (
    <div className="square" style={{background:this.props.color, height:this.props.dimenh, width:this.props.dimenw, fontSize: this.props.fontsize}} onClick={this.props.onClick}>
    {this.props.pressure}
    </div>
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
      onClick={(e) => this.props.onClick(e,i,j)}
      onContextMenu={(e) => this.handleContextMenu(e,i,j)}
      pressure = {pressure}
      dimen = {this.props.dimen}
      dimenh = {this.props.dimenh}
      dimenw={this.props.dimenw}
      fontsize = {this.props.fontsize}
    />
  }

  handleContextMenu = (e,i,j) => {
    this.props.handleContextMenu(e,i,j)
  }

  renderRow(i,m){
    let row = []
    for(let j = 0; j<m; j++){
      row.push(this.renderBlock(i,j));
    }
    return row;
  }

  renderGrid(n,m){
    let grid = []
    for(let i=0; i<n; i++){
      grid.push(this.renderRow(i,m));
    }
    return grid;
  }

  render(){
    const n = this.props.height;
    const m = this.props.width;
    let width = "50vw"
      if(n!=m){
        width = "75vw"
    }
    return(
      <div className="gridx" style={{width:width}}>
        {this.renderGrid(n,m)}
      </div>
    )
  }
}

function Direction(props){
  return(
    <button className="direction" onClick={props.onClick}>
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
        <div className="controls-lhs"><p>Pipe Direction</p></div>
        <div className="controls-rhs">
        <div className="gridc">
          {this.renderBlank()}
          {this.renderDirection("Up")}
          {this.renderBlank()}
          {this.renderDirection("Left")}
          {this.renderBlank()}
          {this.renderDirection("Right")}
          {this.renderBlank()}
          {this.renderDirection("Down")}
          {this.renderBlank()}
         </div>
         </div>
      </div>
    )
  }
}

function Reset(props){
  return(
    <div className="resetdiv">
    <div className="resetdiv-lhs">
    	Reset
    </div>
    <div className="resetdiv-rhs">
	    <button className="submit1" onClick={props.onClick}>Reset</button>
    </div>
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
    <div className="size">
    	<div className="size-lhs">
    		Pipe Size
    	</div>
    	<div className="size-rhs">
		   		
    <div className="inputdiv">
		<label for="small"><input id="small" type="radio" value="small" checked = {this.state.selectedOption=="small"} onChange = {this.handleChange} />0.5 inch</label>
		</div>
    <div className="inputdiv">	  
		<label for = "medium"><input id="medium" type="radio" value="medium" checked = {this.state.selectedOption=="medium"} onChange = {this.handleChange} />
    0.75 inch</label>
    </div>
    <div className="inputdiv">  		
		<label for="large"><input id="large" type="radio" value="large" checked = {this.state.selectedOption=="large"} onChange = {this.handleChange} />
      1 inch</label>
    </div>		
    
		</div>
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
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(e) {
    this.setState({
      initial_pressure: e.target.value
    });
  }

  handleSubmit(e) {
    let pressure = this.state.initial_pressure;
    this.setState({
      initial_pressure: ''
    })
    this.props.handlePressureChange(e,pressure)
  }

  render() {
    return(
    	<div className="init-pressure">
	      <div className="init-pressure-lhs">
	      	Change Initial Pressure
	      </div>
	      <div className="init-pressure-rhs">	
	      <form onSubmit={(e) => this.handleSubmit(e)}>
	        <div className="pdisplay">
          <input type="text" onChange = {this.handleChange} className="pressure-input" value={this.state.initial_pressure} />       
	        <button className="submit" type="submit">
	        Apply
	        </button>
          </div>
	      </form>
	      </div>
	    </div>
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
    this.handleBlockClick = this.handleBlockClick.bind(this);
    this.setVisibility = this.setVisibility.bind(this);
    let size = 22
    let height = 22
    let width = 22
    let grid = []
    let row = size-1
    let col = 0
    let pressure = []
    let frac = 100/size
    let dimen = frac.toString() + "%";
    let fracw = 100/width
    let frach = 100/height
    let dimenw = fracw.toString() + "%";
    let dimenh = frach.toString() + "%";
    console.log(dimen)
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
      dimenw: dimenw,
      dimenh: dimenh,
      fontsize: 0,
      height: height,
      width: width,
    };
   
  }
  componentDidMount(){
    var self = this
    /*document.addEventListener('click', function(event){
      self.setState({visible: false});
    });*/
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
            }, 300);
    }

  handleDirectionClick(direction) {
    let game_id = this.state.game_id
    let pipe_size = this.state.pipe_size
    //console.log(this.state.grid[5][4]);
    WebSocketInstance.directionClick(game_id,direction,pipe_size)
  }

  handleBlockClick(e,i,j){
    let game_id = this.state.game_id
    const grid = this.state.grid;
    if(grid[i][j]=="split" || grid[i][j]=="tap"){
   		WebSocketInstance.blockClick(game_id,i,j)
   	}
   	else if(grid[i][j].split("_")[0]=="pipe"){
   		this.handleContextMenu(e,i,j)
   	}
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
    WebSocketInstance.connect(game_id);
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
    const height = parsedData['height']
    const width = parsedData['width']
    let frac = 100/size;
    let dimen = frac.toString() + "%"
    let frach = 100/height
    let fracw = 100/width
    let dimenh = frach.toString() + "%"
    let dimenw = fracw.toString() + "%"
    let fontsz = 0
    if(size==13){
      fontsz = 3
    }
    else if(size==22){
      fontsz = 2
    }
    else{
      fontsz = 1.4
    }
    let fontsize = fontsz.toString() + "vw";
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
      height: height,
      width: width,
      dimen: dimen,
      dimenh: dimenh,
      dimenw: dimenw,
      fontsize: fontsize,
    })
    console.log(height,frach,dimenh)
    console.log(width,fracw,dimenw)
  }

  handleContextMenu(e,i,j){
    const grid = this.state.grid;
    if(grid[i][j].split("_")[0]=="pipe"){
      const game_id = this.state.game_id
      WebSocketInstance.pipe_click(game_id,i,j)
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
      var self =this
      document.addEventListener('click', this.setVisibility);
    }
  }

  setVisibility = () =>{
  	this.setState({visible:false})
  	document.removeEventListener('click', this.setVisibility);
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
    const height = this.state.height
    const width = this.state.width
    const grid = this.state.grid
    const loggedIn = this.state.loggedIn
    const pressure = this.state.pressure
    const cost = this.state.cost
    const budget = this.state.budget
    const color = budget>=cost ? "green" : "red"
    const dimen = this.state.dimen
    const dimenh = this.state.dimenh
    const dimenw = this.state.dimenw
    const fontsize = this.state.fontsize
    let div_width = "75vw"

    if(height!=width){
      div_width = "100vw"
    }
    return(
       loggedIn ?
      <div className='container'>
      <div className = 'rowC ' style={{width:div_width}}>
      
          <Grid 
            size={size}
            height={height}
            width={width}
            grid={grid}
            onClick = {(e,i,j) => this.handleBlockClick(e,i,j)}
            handleContextMenu = {this.handleContextMenu}
            pressure = {pressure}
            dimen = {dimen}
            dimenh={dimenh}
            dimenw={dimenw}
            fontsize = {fontsize}
          />
        
        <div className='lhs'>       
            <div className="budget">
              <div className="budget-lhs">
                Budget
              </div>
              <div className="budget-rhs">  
                {budget}
              </div>
            </div>
            <Controls
              onClick = {(direction) => this.handleDirectionClick(direction)}
            />
            <SelectPipe
            	handleOptionChange = {this.handleOptionChange}
            	selectedOption = {this.state.pipe_size}
            />
            <div className="money-spent">
              <div className="money-spent-lhs">
                Money Spent
              </div>
              <div className="money-spent-rhs" style={{color:color}}>
                {cost}
              </div>
            </div>
            <div className="money-rem">
              <div className="money-rem-lhs">
                Money Remaining
              </div>
              <div className="money-rem-rhs" style={{color:color}}>
                {budget-cost}
              </div>
            </div>           
            <ChangeInitialPressure 
              handlePressureChange = {this.handlePressureChange} />
            <Reset
              onClick = {() => this.handleReset()}
            />

        </div>



        {this.state.visible &&
          <div style={{position:"absolute", top:this.state.menuY, left:this.state.menuX}} className="menu">
          	<div>
            <button onClick={this.handleDeletePipe} value="del" className="menu-buttons">
            Delete pipe
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="large" className="menu-buttons">
            Change to 1 inch
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="medium" className="menu-buttons">
            Change to 0.75 inch
            </button>
            </div>
            <div>
            <button onClick={this.handleSizeChange} value="small" className="menu-buttons">
            Change to 0.5 inch
            </button>
            </div>
            </div>
        }

      </div>
      <div className="links">
        Feeling Lost? Here's a <a href="https://phet.colorado.edu/sims/cheerpj/fluid-pressure-and-flow/latest/fluid-pressure-and-flow.html" target="_blank">simulation</a> and some <a href="/sim/tutorials" target="_blank"> tutorials</a>.
      </div>
      </div>
            :
      <LoginComponent
        handleLogin = {this.handleLogin} />
    )
  }
}

export default App;
