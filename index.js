const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const score = document.querySelector('#score')
const audio = document.querySelector('#audio')


const STATES = {
	START: 0,
	PLAYING: 1,
	GAMEOVER: 2,
}

const INITIAL_BOX_WIDTH = 200
const BOX_HEIGHT = 30
const INITIAL_BOX_Y = 600

const INITIAL_Y_SPEED = 10
const INITIAL_X_SPEED = 1

let boxes = []
let debris = { x: 0, y: 0, width: 0 }
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed

function randomColor() {
	const red = Math.floor(Math.random() * 255)
	const green = Math.floor(Math.random() * 255)
	const blue = Math.floor(Math.random() * 255)

	return `rgb(${red}, ${green}, ${blue})`
}

function initializedGameState() {
	boxes = [
		{
			x: canvas.width / 2 - INITIAL_BOX_WIDTH / 2,
			y: 100,
			width: INITIAL_BOX_WIDTH,
			color: 'white',
		},
	]

	mode = STATES.START
	scrollCounter = 0
	cameraY = 0
	xSpeed = INITIAL_X_SPEED
	ySpeed = INITIAL_Y_SPEED
	current = 1

	createNewBox()

	score.textContent = current - 1
}

function restart() {
	initializedGameState()
	draw()
}

function draw() {
	if (mode === STATES.GAMEOVER) return

	drawBackground()
	drawBoxes()
	drawDebris()

	if (mode === STATES.START) {
		moveAndCollision()
	} else if (mode === STATES.PLAYING) {
		updatePlayingMode()
	}

	debris.y -= ySpeed
	updateCamera()

	window.requestAnimationFrame(draw)
}

function drawBackground() {
	ctx.fillStyle = 'gray'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawBoxes() {
	boxes.forEach(box => {
		const { x, y, width, color } = box
		const newY = INITIAL_BOX_Y - y + cameraY

		ctx.fillStyle = color
		ctx.fillRect(x, newY, width, BOX_HEIGHT)
	})
}

function createNewBox() {
	boxes[current] = {
		x: 0,
		y: (current + 18) * BOX_HEIGHT,
		width: boxes[current - 1].width,
		color: randomColor(),
	}
}

function moveAndCollision() {
	boxes[current].x += xSpeed

	const isRigthMove = xSpeed > 0
	const isLeftMove = xSpeed < 0

	const isRigthCollision =
		boxes[current].x + boxes[current].width > canvas.width

	const isLeftCollision = boxes[current].x < 0

	if ((isRigthMove && isRigthCollision) || (isLeftMove && isLeftCollision)) {
		boxes[current].x = -xSpeed
	}
}

function updatePlayingMode() {
	boxes[current].y -= ySpeed
	const previousBox = boxes[current - 1]

	if (boxes[current].y === previousBox.y + BOX_HEIGHT) {
		handleBoxLanding()
	}
}

function handleBoxLanding() {
	const currentBox = boxes[current]
	const previousBox = boxes[current - 1]

	const diff = currentBox.x - previousBox.x

	if (Math.abs(diff) >= currentBox.width) {
		drawGameOver()
		return
	}

	if (diff > 0) {
		currentBox.width -= diff
	} else {
		currentBox.x = previousBox.x
		currentBox.width += diff
	}

	createNewDebris(diff)

	xSpeed += xSpeed > 0 ? 0.25 : -0.25
	current++
	scrollCounter = BOX_HEIGHT
	mode = STATES.START

	score.textContent = current - 1

	createNewBox()
}

function createNewDebris(diff) {
	const currentBox = boxes[current]
	const previousBox = boxes[current - 1]

	const debrisX =
		currentBox.x > previousBox.x
			? currentBox.x + currentBox.width
			: currentBox.x

	debris = {
		x: debrisX,
		y: currentBox.y,
		width: diff,
	}
}

function drawDebris() {
	const newY = INITIAL_BOX_Y - debris.y + cameraY
	ctx.fillStyle = 'red'
	ctx.fillRect(debris.x, newY, debris.width, BOX_HEIGHT)
}


function drawGameOver() {
	mode = STATES.GAMEOVER
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = 'white'
	ctx.font = 'bold 40px Arial'
	ctx.textAlign = 'center'
	ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
	ctx.font = 'bold 20px Arial'
	ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 40)
}

function updateCamera() {
	if (scrollCounter > 0) {
		cameraY += scrollCounter
		scrollCounter = 0
	}
}

canvas.onpointerdown = e => {
	if (mode === STATES.START) {
		mode = STATES.PLAYING
		return
	}
	if (mode === STATES.GAMEOVER) {
		restart()
		return
	}
}

window.addEventListener('keydown', e => {
	if (e.key === ' ' && mode === STATES.START) {
		mode = STATES.PLAYING
	} else if ((e.key === 'r' || e.key === ' ') && mode === STATES.GAMEOVER) {
		restart()
	}
})

restart()
