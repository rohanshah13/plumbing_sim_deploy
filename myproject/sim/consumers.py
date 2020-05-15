from channels.generic.websocket import AsyncWebsocketConsumer
import json
from sim.models import Game
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async

class MyConsumer(AsyncWebsocketConsumer):

	@database_sync_to_async
	def save(self,game):
		game.save()

	@database_sync_to_async
	def get_game(self,username):
		return Game.objects.get(user=username)
	
	async def init_game(self,data):
		username = data['username']
		grid = []
		size = 10
		for i in range(size):
			row = []
			for j in range(size):
				row.append('blank')
			grid.append(row)
		row = size-1
		col = 0
		grid[row][col] = 'active'
		json_grid = json.dumps(grid)
		game = Game(user=username,size=size,row=row,col=col,grid=json_grid)
		await self.save(game)
		await self.sendMessage(grid,size,row,col)
		
	async def reset(self,data):
		username = data['username']
		grid = []
		size = 10
		for i in range(size):
			row = []
			for j in range(size):
				row.append('blank')
			grid.append(row)
		row = size-1
		col = 0
		grid[row][col] = 'active'
		json_grid = json.dumps(grid)
		game =  await self.get_game(username)
		game.grid = json_grid
		game.row = row
		game.col = col
		await self.save(game)
		await self.sendMessage(grid,size,row,col)

	async def block_click(self,data):
		username = data['username']
		game = await self.get_game(username)
		i = int(data['i'])
		j = int(data['j'])
		row = game.row
		col = game.col
		size = game.size
		grid = json.loads(game.grid)
		print(i)
		print(grid[6][3])
		if(grid[i][j]=='split'):
			grid[i][j] = 'active'
			grid[row][col] = 'split'
			game.grid = json.dumps(grid)
			game.row = i
			game.col = j
			await self.save(game)
			await self.sendMessage(grid,size,i,j)

	async def direction_click(self,data):
		username = data['username']
		game = await self.get_game(username)
		direction = data['direction']
		row = game.row
		col = game.col
		size = game.size
		grid = json.loads(game.grid)
		currIndex = (row,col)
		idx1 = None
		idx2 = None 
		idx3 = None
		if(direction=='U'):
			idx1 = (row-1,col)
			idx2 = (row-2,col)
			idx3 = (row-3,col)
		elif(direction=='D'):
			idx1 = (row+1,col)
			idx2 = (row+2,col)
			idx3 = (row+3,col)
		elif(direction=='L'):
			idx1 = (row,col-1)
			idx2 = (row,col-2)
			idx3 = (row,col-3)
		else:
			idx1 = (row,col+1)
			idx2 = (row,col+2)
			idx3 = (row,col+3)
		valid = False
		if 0<=idx3[0]<size and 0<=idx3[1]<size:
			if grid[idx1[0]][idx1[1]] == 'blank' and grid[idx2[0]][idx2[1]] == 'blank' and grid[idx3[0]][idx3[1]] == 'blank':
				valid = True
		if valid:
			grid[row][col] = 'split'
			grid[idx1[0]][idx1[1]] = 'pipe'
			grid[idx2[0]][idx2[1]] = 'pipe'
			grid[idx3[0]][idx3[1]] = 'active'
			row = idx3[0]
			col = idx3[1]
			game.row = row 
			game.col = col
			game.grid = json.dumps(grid)
			await self.save(game)
			await self.sendMessage(grid,size,row,col)



	async def sendMessage(self,grid,size,row,col):
		content = {
			'command' : 'game',
			'grid' : grid,
			'size' : size,
			'row' : row,
			'col' : col
		}
		await self.send(text_data=json.dumps(content))

	async def connect(self):
		print('connected')

		await self.accept()

	async def initial(self):
		pass

	async def disconnect(self, close_code):
		pass

	async def receive(self, text_data):
		json_data = json.loads(text_data)
		if(json_data['command']=='init'):
			await self.init_game(json_data)
		elif(json_data['command']=='reset'):
			await self.reset(json_data)
		elif(json_data['command']=='block_click'):
			await self.block_click(json_data)
		elif(json_data['command']=='direction_click'):
			await self.direction_click(json_data)