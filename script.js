body {
  font-family: Arial, sans-serif;
  text-align: center;
  background: #f0f0f0;
  margin: 0;
  padding: 0;
}

h1 {
  background: #ff6f61;
  color: white;
  padding: 20px;
  margin: 0;
}

#game {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

#board {
  display: grid;
  grid-template-columns: repeat(15, 40px);
  grid-template-rows: repeat(15, 40px);
  gap: 1px;
  width: 600px;
  height: 600px;
  border: 3px solid #333;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.red { background: #ff4d4d; }
.green { background: #4dff4d; }
.yellow { background: #ffff66; }
.blue { background: #4da6ff; }
.safe { border: 2px solid #000; }

.token {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #000;
}
