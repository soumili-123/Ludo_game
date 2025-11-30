import pygame
import random
import sys

# -------------------- Initialize --------------------
pygame.init()
WIDTH, HEIGHT = 600, 600
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Classic Ludo")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 200, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
GRAY = (200, 200, 200)

FPS = 30
CELL = WIDTH // 15

# -------------------- Token Class --------------------
class Token:
    def __init__(self, color, start_pos):
        self.color = color
        self.pos = -1   # -1 = home, 0+ = path
        self.start_pos = start_pos
        self.rect = pygame.Rect(0,0,CELL-4,CELL-4)
    
    def draw(self, win, path_coords):
        if self.pos == -1:
            x, y = self.start_pos
        else:
            x, y = path_coords[self.pos]
        self.rect.topleft = (x+2, y+2)
        pygame.draw.ellipse(win, self.color, self.rect)

# -------------------- Path --------------------
# Simplified linear path (52 steps)
path_coords = []
for i in range(6, 9):
    for j in range(6, 15):
        path_coords.append((j*CELL, i*CELL))
for i in range(7, 15):
    path_coords.append((14*CELL, i*CELL))
for j in range(13, 5, -1):
    path_coords.append((j*CELL, 14*CELL))
for i in range(13, 5, -1):
    path_coords.append((0, i*CELL))
for j in range(1, 8):
    path_coords.append((j*CELL, 6*CELL))
for i in range(1, 7):
    path_coords.append((6*CELL, i*CELL))

# -------------------- Setup --------------------
players = ['Red', 'Green', 'Yellow', 'Blue']
colors = [RED, GREEN, YELLOW, BLUE]
start_positions = [(0,0),(WIDTH-CELL*3,0),(WIDTH-CELL*3,HEIGHT-CELL*3),(0,HEIGHT-CELL*3)]
tokens = []

for color, start in zip(colors, start_positions):
    tokens.append([Token(color, start) for _ in range(4)])

current_player = 0
dice_roll = 0

# -------------------- Draw Board --------------------
def draw_board(win):
    win.fill(WHITE)
    # Draw grid
    for i in range(15):
        for j in range(15):
            rect = pygame.Rect(j*CELL,i*CELL,CELL,CELL)
            pygame.draw.rect(win, BLACK, rect, 1)
    # Draw home squares
    pygame.draw.rect(win, RED, pygame.Rect(0,0, CELL*6, CELL*6))
    pygame.draw.rect(win, GREEN, pygame.Rect(CELL*9,0, CELL*6, CELL*6))
    pygame.draw.rect(win, YELLOW, pygame.Rect(CELL*9,CELL*9, CELL*6, CELL*6))
    pygame.draw.rect(win, BLUE, pygame.Rect(0,CELL*9, CELL*6, CELL*6))

# -------------------- Main Loop --------------------
run = True
clock = pygame.time.Clock()

font = pygame.font.SysFont(None, 30)

while run:
    clock.tick(FPS)
    draw_board(WIN)
    
    # Draw tokens
    for player_tokens in tokens:
        for t in player_tokens:
            t.draw(WIN, path_coords)
    
    # Display info
    info = font.render(f"Current Player: {players[current_player]}  |  Dice Roll: {dice_roll}", True, BLACK)
    WIN.blit(info, (10, HEIGHT - 30))
    
    pygame.display.update()
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            run = False
        
        # Roll dice on key press
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                dice_roll = random.randint(1,6)
                
                # Move first available token
                moved = False
                for t in tokens[current_player]:
                    if t.pos + dice_roll <= len(path_coords)-1:
                        if t.pos == -1 and dice_roll != 6:
                            continue  # need 6 to leave home
                        t.pos = 0 if t.pos == -1 else t.pos + dice_roll
                        moved = True
                        break
                if not moved:
                    print(f"{players[current_player]} cannot move")
                
                # Check win
                if all(t.pos == len(path_coords)-1 for t in tokens[current_player]):
                    print(f"{players[current_player]} Wins! 🎉")
                    run = False
                
                # Next player
                current_player = (current_player + 1) % 4

pygame.quit()
sys.exit()
