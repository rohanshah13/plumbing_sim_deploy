from channels.generic.websocket import AsyncWebsocketConsumer
import json
from sim.models import Game, Log
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from sim.constants import Cost, Grids, Size, Direction, GridSize
from postgres_copy import CopyManager
import os
import csv
import pickle
from django.http import HttpResponse

class MyConsumer(AsyncWebsocketConsumer):

	@database_sync_to_async
	def save(self,game=None,log=None):
		if log:
			log.save()
		if game:
			game.save()

	@database_sync_to_async
	def check(self,game_id):
		return Game.objects.filter(game_id=game_id).exists()

	@database_sync_to_async
	def get_game(self,game_id):
		return Game.objects.get(game_id=game_id)

	@database_sync_to_async
	def delete_game(self,game_id):
		Game.objects.filter(game_id=game_id).delete()
	
	def __init__(self,x):
		super(MyConsumer,self).__init__(x)
		self.game_id = ''

	async def init_game(self,data):
		game_id = data['game_id']
		budget = data['budget']
		grid_size = data['grid_size']
		if await self.check(game_id):
			print('game_exists')
			game = await self.get_game(game_id)
			if False:
				content = {
					'command' : 'fail'
				}
				await self.send(text_data=json.dumps(content))
			else:
				print('game inactive')
				#game.logged_in = True
				await self.save(game)
				await self.update({'id':game_id},True)
		else:
			self.game_id = game_id
			pressure = []
			grid = Grids[grid_size]
			size = len(grid[0])
			height = len(grid)
			width = len(grid[0])
			for i in range(height):
				#row = []
				prow = []
				for j in range(width):
					#row.append('blank')
					prow.append('')
				#grid.append(row)
				pressure.append(prow)
			row = height-1
			col = 0
			print(len(grid),row,col)
			grid[row][col] = 'active'
			#print(grid[row][col])
			pressure[row][col] = '60'
			#async def calc_pressure(self,initial_pressure,grid,size,height,width)
			pressure  = await self.calc_pressure(60,grid,size,height,width)
			if(grid_size=='sub_opt'):
				cost = 3057
			else:
				cost = 0
			json_grid = json.dumps(grid)
			json_pressure = json.dumps(pressure)
			info = {}
			info['Budget'] = budget
			info['Grid Size'] = GridSize[grid_size]
			game = Game(logged_in = True, game_id=game_id,size=size,row=row,col=col,grid=json_grid,pressure=json_pressure,budget=budget,height=height,width=width,cost=cost)
			log = Log(action='Login', sim_id = game_id, money_spent = 0, money_left = game.budget, info = info)
			await self.save(game,log)
			await self.update({'id':game_id},True)
		
	async def reset(self,data):
		game_id = data['game_id']
		game =  await self.get_game(game_id)
		pressure = []
		if game.height == game.width:
			grid_size = GridSize[game.size]
		else:
			grid_size = 'sub_opt'
		grid = Grids[grid_size]

		size = len(grid[0])
		height = len(grid)
		width = len(grid[0])
		for i in range(height):
			row = []
			prow = []
			for j in range(width):
				row.append('blank')
				prow.append('')
			#grid.append(row)
			pressure.append(prow)
		row = height-1
		col = 0
		grid[row][col] = 'active'
		pressure[row][col] = '60'
		pressure  = await self.calc_pressure(60,grid,size,height,width)
		game.pressure = json.dumps(pressure)
		game.grid = json.dumps(grid)
		game.row = row
		game.col = col
		game.initial_pressure = '60'
		game.cost = 0
		info = {}
		
		if(grid_size=='sub_opt'):
			game.cost = 3057
		else:
			game.cost = 0
		json_grid = json.dumps(grid)
		#logging
		log = Log(action="Reset", sim_id=game_id, money_spent=0, money_left=game.budget, info=info)
		
		await self.save(game,log)
		await self.update({'id':game_id},True)

	async def block_click(self,data):
		
		#load variables
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		row = game.row
		col = game.col
		size = game.size
		height = game.height
		width = game.width
		pressure = json.loads(game.pressure)
		grid = json.loads(game.grid)
		print(game.budget)
		#print(i)
		#print(grid[6][3])
		if(grid[i][j]=='split' or grid[i][j]=='tap'):
			if grid[i][j]=='split':
				grid[i][j] = 'active'
			else:
				grid[i][j] = 'tap_active'
			if grid[row][col]=='active':
				grid[row][col] = 'split'
			else:
				grid[row][col] = 'tap'
			game.grid = json.dumps(grid)
			game.row = i
			game.col = j
			
			#logging
			money_left = int(game.budget) - game.cost
			info ={}
			if pressure[i][j]!='':
				info['Pressure'] = int(pressure[i][j])
			log = Log(sim_id = game_id, action = "Click on joint", location='('+str(i)+','+str(j)+')', 
				money_spent = game.cost, money_left = money_left, info =info)
			
			await self.save(game,log)
			await self.update({'id':game_id},True)
			

	async def delete_pipe(self,data):
		
		#load variables
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		currSplitX = game.row
		currSplitY = game.col
		size = game.size
		height = game.height
		width = game.width	
		pressure = json.loads(game.pressure)
		initial_pressure = game.initial_pressure
		grid = json.loads(game.grid)
		pipe_size = grid[i][j].split('_')[2]
		direction = grid[i][j].split('_')[1]
		direction = Direction[direction]
		
		if j+1<width and grid[i][j+1].split('_')[0] == 'pipe':
			ni = i
			nj = j+1
			split1X = i
			split1Y = j-1
			split2X = i
			split2Y = j+2
		elif j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ni = i
			nj = j-1
			split1X = i
			split1Y = j+1
			split2X = i
			split2Y = j-2
		elif i+1<height and grid[i+1][j].split('_')[0] == 'pipe':
			ni = i+1
			nj = j
			split1X = i-1
			split1Y = j
			split2X = i+2
			split2Y = j
		else:
			ni = i-1
			nj = j
			split1X = i+1
			split1Y = j
			split2X = i-2
			split2Y = j
		bend_deleted1 = False
		bend_deleted2 = False
		if await self.is_junction(grid,split1X,split1Y,size,height,width):
			game.cost -= Cost['junction']
			bend_deleted1 = True
		if await self.is_junction(grid,split2X,split2Y,size,height,width):
			game.cost -= Cost['junction']
			bend_deleted2 = True
		grid[i][j] = 'blank'
		grid[ni][nj] = 'blank'
		game.cost -= Cost[pipe_size]
		if await self.emptySplit(split1X,split1Y,grid,size,height,width):
			if grid[split1X][split1Y] in ['tap','tap_active']:
				grid[split1X][split1Y] = 'tap'
			elif not (split1X == height-1 and split1Y == 0):
				print(split1X,split1Y)
				grid[split1X][split1Y] = 'blank'
			else:
				grid[split1X][split1Y] = 'split'
			if currSplitX == split1X and currSplitY == split1Y:
				grid[height-1][0] = 'active'
				currSplitX = height-1
				currSplitY = 0
		if await self.emptySplit(split2X,split2Y,grid,size,height,width):
			if grid[split2X][split2Y] in ['tap','tap_active']:
				grid[split2X][split2Y] = 'tap'
			elif not (split2X == height-1 and split2Y == 0):
				print(split2X,split2Y)
				grid[split2X][split2Y] = 'blank'
			else:
				grid[split2X][split2Y] = 'split'
			if currSplitX == split2X and currSplitY == split2Y:
				grid[height-1][0] = 'active'
				currSplitX = height-1
				currSplitY = 0
		if await self.is_junction(grid,split1X,split1Y,size,height,width):
			game.cost += Cost['junction']
			bend_deleted1 = False
		if await self.is_junction(grid,split2X,split2Y,size,height,width):
			game.cost += Cost['junction']
			bend_deleted2 = False
		
		#logging
		if bend_deleted1:
			money_spent = game.cost+Cost[pipe_size]
			money_left = game.budget - money_spent
			location = '(' + str(split1X) + ',' + str(split1Y) + ')'
			info = {}
			log = Log(sim_id=game_id,action="Removed Pipe Bend", money_left=money_left,
			money_spent=money_spent,location=location, info=info)
			await self.save(None,log)
		if bend_deleted2:
			money_spent = game.cost+Cost[pipe_size]
			money_left = game.budget - money_spent
			location = '(' + str(split2X) + ',' + str(split2Y) + ')'
			info = {}
			log = Log(sim_id=game_id,action="Removed Pipe Bend", money_left=money_left,
			money_spent=money_spent,location=location, info=info)
			await self.save(None,log)
		
		game.row = currSplitX
		game.col = currSplitY
		pressure = await self.calc_pressure(initial_pressure,grid,size,height,width)
		game.grid = json.dumps(grid)
		game.pressure = json.dumps(pressure)
		
		#logging
		s1x,s1y,s2x,s2y = split1X, split1Y, split2X, split2Y
		money_left = int(game.budget) - game.cost
		location = '(' + str(s1x) + ',' + str(s1y) + ') - (' + str(s2x) + ',' + str(s2y) + ')'
		info = {}
		info['Direction'] = direction
		info['Diameter'] = Size[pipe_size]
		if (grid[s1x][s1y] == 'split' or grid[s1x][s1y] == 'active') and (grid[s2x][s2y] == 'split' or grid[s2x][s2y] == 'active'):
			info['Delete from middle'] = 'Yes'
		else:
			info['Delete from middle'] = 'No'
		if pressure[s1x][s1y] != '':
			info['Active Pressure'] = int(pressure[split1X][split1Y])
		elif pressure[s2x][s2y] != '':
			info['Active Pressure'] = int(pressure[split2X][split2Y])

		log = Log(sim_id=game_id, action="Deleted Pipe", money_spent=game.cost,
			money_left=money_left, location=location, info=info)
		
		await self.save(game,log)
		await self.update({'id':game_id},True)

	async def emptySplit(self,i,j,grid,size,height,width):
		ret = True
		if i+1<height and grid[i+1][j].split('_')[0] == 'pipe':
			ret = False
		if i-1>=0 and grid[i-1][j].split('_')[0] == 'pipe':
			ret = False
		if j+1<width and grid[i][j+1].split('_')[0] == 'pipe':
			ret = False
		if j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ret = False
		return ret

	async def change_size(self,data):
		
		#load variables
		game_id = data['game_id']
		game = await self.get_game(game_id)
		pipe_size = data['pipe_size']
		i = int(data['i'])
		j = int(data['j'])
		size = game.size
		height = game.height
		width = game.width
		grid = json.loads(game.grid)
		pressure = json.loads(game.pressure)
		initial_pressure = game.initial_pressure
		direction = grid[i][j].split('_')[1]
		pipe_direction = Direction[direction]
		initial_size = grid[i][j].split('_')[2]
		game.cost -= Cost[initial_size]

		if j+1<width and grid[i][j+1].split('_')[0] == 'pipe':
			ni = i
			nj = j+1
			s1x,s1y,s2x,s2y = i,j-1,i,j+2
		elif j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ni = i
			nj = j-1
			s1x,s1y,s2x,s2y = i,j-2,i,j+1
		elif i+1<height and grid[i+1][j].split('_')[0] == 'pipe':
			ni = i+1
			nj = j
			s1x,s1y,s2x,s2y = i-1,j,i+2,j
		else:
			ni = i-1
			nj = j
			s1x,s1y,s2x,s2y = i-2,j,i+1,j
		grid[i][j] = 'pipe' + '_' + direction + '_' + pipe_size
		grid[ni][nj] = 'pipe' + '_' + direction + '_' + pipe_size
		game.cost += Cost[pipe_size]
		pressure = await self.calc_pressure(initial_pressure,grid,size,height,width)
		game.grid = json.dumps(grid)
		game.pressure = json.dumps(pressure)
		#logging
		location = '(' + str(s1x) + ',' + str(s1y) + ') - (' + str(s2x) + ',' + str(s2y) + ')'
		info = {}
		info['Direction'] = pipe_direction
		info['Initial Diameter'] = Size[initial_size]
		info['Final Diameter'] = Size[pipe_size]
		if pressure[s1x][s1y] != '':
			info['Start Pressure'] = max(int(pressure[s1x][s1y]), int(pressure[s2x][s2y]))
			info['End Pressure'] = min(int(pressure[s1x][s1y]),int(pressure[s2x][s2y]))
		money_left = game.budget - game.cost
		log = Log(sim_id=game_id, action = "Changed Pipe Diameter", money_spent=game.cost,money_left=money_left,
			location=location, info=info)

		await self.save(game,log)
		await self.update({'id':game_id},True)

	async def cycle_check(self,grid,row,col,xpos,ypos,size,height,width):
		visited = []
		for i in range(height):
			temp = []
			for j in range(width):
				temp.append(False)
			visited.append(temp)
		visited[row][col] = True
		queue = []
		queue.append((row,col))
		while queue:
			u = queue.pop(0)
			visited[u[0]][u[1]] = True			
			if u[0]+1<height and grid[u[0]+1][u[1]].split('_')[0]=='pipe' and (not visited[u[0]+3][u[1]]):
				queue.append((u[0]+3,u[1]))
			if u[0]-1>=0 and grid[u[0]-1][u[1]].split('_')[0]=='pipe' and (not visited[u[0]-3][u[1]]):
				queue.append((u[0]-3,u[1]))
			if u[1]+1<width and grid[u[0]][u[1]+1].split('_')[0]=='pipe' and (not visited[u[0]][u[1]+3]):
				queue.append((u[0],u[1]+3))
			if u[1]-1>=0 and grid[u[0]][u[1]-1].split('_')[0]=='pipe' and (not visited[u[0]][u[1]-3]):
				queue.append((u[0],u[1]-3))
		if visited[xpos][ypos]:
			return False
		else:
			return True

	async def is_junction(self,grid,i,j,size,height,width):
		ret = False
		if (i+1<height and grid[i+1][j].split('_')[0] == 'pipe') or (i-1>=0 and grid[i-1][j].split('_')[0] == 'pipe'):
			if (j+1<width and grid[i][j+1].split('_')[0] == 'pipe') or (j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe'):
				ret = True
		return ret

	async def direction_click(self,data):
		
		#load variables
		game_id = data['game_id']
		game = await self.get_game(game_id)
		direction = data['direction'][0]
		pipe_size = data['pipe_size']
		row = game.row
		col = game.col
		size = game.size
		height = game.height
		width = game.width
		grid = json.loads(game.grid)
		pressure = json.loads(game.pressure)
		initial_pressure = str(game.initial_pressure)
		currIndex = (row,col)

		idx1 = None
		idx2 = None 
		idx3 = None
		if(direction=='U'):
			idx1 = (row-1,col)
			idx2 = (row-2,col)
			idx3 = (row-3,col)
			pipe_direction = 'Up'
		elif(direction=='D'):
			idx1 = (row+1,col)
			idx2 = (row+2,col)
			idx3 = (row+3,col)
			pipe_direction = 'Down'
		elif(direction=='L'):
			idx1 = (row,col-1)
			idx2 = (row,col-2)
			idx3 = (row,col-3)
			pipe_direction = 'Left'
		else:
			idx1 = (row,col+1)
			idx2 = (row,col+2)
			idx3 = (row,col+3)
			pipe_direction = 'Right'

		#logging
		money_left = game.budget - game.cost
		location = '(' + str(row) + ',' + str(col) + ')'
		info = {}
		info["Diameter"] = Size[pipe_size]
		info['Direction'] = pipe_direction
		log = Log(sim_id = game_id, action='Clicked on Pipe Direction Button', money_spent=game.cost,
			money_left = money_left, location=location, info=info)
		await self.save(None,log)

		valid = False
		if 0<=idx3[0]<height and 0<=idx3[1]<width:
			if grid[idx1[0]][idx1[1]] == 'blank' and grid[idx2[0]][idx2[1]] == 'blank' and grid[idx3[0]][idx3[1]] in ['blank']:
				valid = True
			elif grid[idx1[0]][idx1[1]] == 'blank' and grid[idx2[0]][idx2[1]] == 'blank' and grid[idx3[0]][idx3[1]] in ['split','tap']:
				valid = await self.cycle_check(grid,row,col,idx3[0],idx3[1],size,height,width)
		if valid:
			prev1,prev2=False,False
			if await self.is_junction(grid,row,col,size,height,width):
				game.cost -= Cost['junction']
				prev1 = True
			if await self.is_junction(grid,idx3[0],idx3[1],size,height,width):
				game.cost -= Cost['junction']
				prev2 = True
			if not (grid[row][col] in ['tap','tap_active']):
				grid[row][col] = 'split'
			else:
				grid[row][col] = 'tap'
			grid[idx1[0]][idx1[1]] = 'pipe' + '_' + direction + '_' + pipe_size
			grid[idx2[0]][idx2[1]] = 'pipe'+ '_' + direction + '_' + pipe_size
			if grid[idx3[0]][idx3[1]] == 'tap':
				grid[idx3[0]][idx3[1]] = 'tap_active'
			else:
				grid[idx3[0]][idx3[1]] = 'active' 
			game.cost += Cost[pipe_size]
			if await self.is_junction(grid,row,col,size,height,width):
				game.cost += Cost['junction']
				#logging
				if not prev1:
					money_spent = game.cost-Cost[pipe_size]
					money_left = game.budget - money_spent
					location = '(' + str(row) + ',' + str(col) + ')'
					info = {}
					log = Log(sim_id=game_id,action="Added Pipe Bend", money_left=money_left,
						money_spent=money_spent,location=location, info=info)
					await self.save(None,log)

			if await self.is_junction(grid,idx3[0],idx3[1],size,height,width):
				game.cost += Cost['junction']
				#logging
				if not prev2:
					money_spent = game.cost-Cost[pipe_size]
					money_left = game.budget - money_spent
					location = '(' + str(row) + ',' + str(col) + ')'
					log = Log(sim_id=game_id,action="Added Pipe Junction", money_left=money_left,
						money_spent=money_spent,location=location, info=info)
					await self.save(None,log)

			#print(grid[idx1[0]][idx1[1]])
			s1x, s1y = row,col
			row = idx3[0]
			col = idx3[1]
			s2x, s2y = row,col
			pressure = await self.calc_pressure(initial_pressure,grid,size,height,width)
			game.row = row 
			game.col = col
			game.grid = json.dumps(grid)
			game.pressure = json.dumps(pressure)
			
			#logging
			money_spent = game.cost
			money_left = game.budget - game.cost
			location = '(' + str(s1x) + ',' + str(s1y) + ') - (' + str(s2x) + ',' + str(s2y) + ')'
			info = {}
			info['Diameter'] = Size[pipe_size]
			info['Direction'] = pipe_direction
			if pressure[s1x][s1y] != '':
				info['Start Pressure'] = int(pressure[s1x][s1y])
				info['End Pressure'] = int(pressure[s2x][s2y])
			log = Log(sim_id=game_id, action="Added Pipe", location=location, 
				money_spent=money_spent, money_left=money_left, info=info)

			await self.save(game,log)
			await self.update({'id':game_id},True)

	async def change_init_pressure(self,data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		pressure_before = game.initial_pressure
		initial_pressure = data['initial_pressure']
		game.initial_pressure = initial_pressure
		grid = json.loads(game.grid)
		size = game.size
		height = game.height
		width = game.width
		pressure = await self.calc_pressure(initial_pressure,grid,size,height,width)
		game.pressure = json.dumps(pressure)
		
		#logging
		money_spent = game.cost
		money_left = game.budget - game.cost
		info = {}
		info["Pressure before change"] = pressure_before
		info["Pressure after change"] = initial_pressure
		log = Log(sim_id=game_id, action="Changed Initial Pressure", money_spent=money_spent,
			money_left=money_left, info=info)

		await self.save(game, log)
		await self.update({'id':game_id},True)

	async def pipe_click(self, data):
		game_id = data['game_id']
		game = await self.get_game(game_id)
		i = int(data['i'])
		j = int(data['j'])
		grid = json.loads(game.grid)
		height = game.height
		width = game.width
		pressure = json.loads(game.pressure)
		direction = grid[i][j].split('_')[1]
		pipe_size = grid[i][j].split('_')[2]
		direction = Direction[direction]
		pipe_size = Size[pipe_size]	
		if j+1<width and grid[i][j+1].split('_')[0] == 'pipe':
			ni = i
			nj = j+1
			s1x,s1y,s2x,s2y = i,j-1,i,j+2
			pipe_direction = 'vertical'
		elif j-1>=0 and grid[i][j-1].split('_')[0] == 'pipe':
			ni = i
			nj = j-1
			pipe_direction = 'vertical'
			s1x,s1y,s2x,s2y = i,j-2,i,j+1
		elif i+1<height and grid[i+1][j].split('_')[0] == 'pipe':
			ni = i+1
			nj = j
			pipe_direction = 'horizontal'
			s1x,s1y,s2x,s2y = i-1,j,i+2,j
		else:
			ni = i-1
			nj = j
			pipe_direction = 'horizontal'
			s1x,s1y,s2x,s2y = i-2,j,i+1,j
		#logging
		location = '(' + str(s1x) + ',' + str(s1y) + ') - (' + str(s2x) + ',' + str(s2y) + ')'
		info = {}
		info['Direction'] = direction
		info['Diameter'] = pipe_size
		if pressure[s1x][s1y] != '':
			info['End Pressure'] = min(int(pressure[s1x][s1y]), int(pressure[s2x][s2y]))
			info['Start Pressure'] = max(int(pressure[s1x][s1y]), int(pressure[s2x][s2y]))
		money_spent = game.cost
		money_left = game.budget - game.cost
		log = Log(sim_id=game_id, action="Clicked on Pipe", location=location, 
			money_left=money_left, money_spent=money_spent,info=info )
		await self.save(None,log)


	async def calc_pressure(self,initial_pressure,grid,size,height,width):

		pressure = []
		visited = []
		for i in range(height):
			prow = []
			temp = []
			for j in range(width):
				prow.append('')
				temp.append(False)
			pressure.append(prow)
			visited.append(temp)

		pressure[height-1][0] = initial_pressure
		pressure_drop = {}
		pressure_drop["large"] = 1
		pressure_drop["medium"] = 4
		pressure_drop["small"] = 12

		queue = []
		queue.append((height-1,0))
		

		while queue:
			u = queue.pop(0)
			visited[u[0]][u[1]] = True
			current_pressure = int(pressure[u[0]][u[1]])
			if u[0]+1<height and grid[u[0]+1][u[1]].split('_')[0]=='pipe' and (not visited[u[0]+3][u[1]]):
				pipe_size = grid[u[0]+1][u[1]].split('_')[2]
				pressure[u[0]+3][u[1]] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0]+3,u[1]))
			if u[0]-1>=0 and grid[u[0]-1][u[1]].split('_')[0]=='pipe' and (not visited[u[0]-3][u[1]]):
				pipe_size = grid[u[0]-1][u[1]].split('_')[2]
				pressure[u[0]-3][u[1]] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0]-3,u[1]))
			if u[1]+1<width and grid[u[0]][u[1]+1].split('_')[0]=='pipe' and (not visited[u[0]][u[1]+3]):
				pipe_size = grid[u[0]][u[1]+1].split('_')[2]
				pressure[u[0]][u[1]+3] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0],u[1]+3))
			if u[1]-1>=0 and grid[u[0]][u[1]-1].split('_')[0]=='pipe' and (not visited[u[0]][u[1]-3]):
				pipe_size = grid[u[0]][u[1]-1].split('_')[2]
				pressure[u[0]][u[1]-3] = str(max(current_pressure - pressure_drop[pipe_size],0))
				queue.append((u[0],u[1]-3))

		return pressure

	async def update(self,event,source=False):
		game_id = event['id']
		game = await self.get_game(game_id)
		await self.sendMessage(json.loads(game.grid),game.size,game.height,game.width,game.row,game.col,json.loads(game.pressure),game.initial_pressure,game.cost,game.budget)
		if source:
			await self.channel_layer.group_send(
					self.group_name,
					{
						'type': 'update',
						'id': game_id
					}
			)

	async def sendMessage(self,grid,size,height,width,row,col,pressure,initial_pressure,cost,budget):
		content = {
			'command' : 'game',
			'grid' : grid,
			'size' : size,
			'height': height,
			'width': width,
			'row' : row,
			'col' : col,
			'pressure': pressure,
			'initial_pressure': initial_pressure,
			'cost': cost,
			'budget': budget
		}
		await self.send(text_data=json.dumps(content))

	async def connect(self):
		print('connected')
		self.group_name = self.scope['url_route']['kwargs']['id']
		#self.group_name = 'rohan'
		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)

		await self.accept()

	async def initial(self):
		pass

	async def disconnect(self, close_code):
		#print(game_id)
		print(self.game_id)
		game = await self.get_game(self.game_id)
		game.logged_in = False
		await self.save(game)

		await self.channel_layer.group_discard(
			self.group_name,
			self.channel_name
		)
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
		elif(json_data['command']=='change_size'):
			await self.change_size(json_data)
		elif(json_data['command']=='delete_pipe'):
			await self.delete_pipe(json_data)
		elif json_data['command'] == 'change_init_pressure':
			await self.change_init_pressure(json_data)
		elif json_data['command'] == 'pipe_click':
			await self.pipe_click(json_data)
