const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const score = document.querySelector('#score')

const STATES = {
	START: 0,
	PLAYING: 1,
	GAMEOVER: 2,
}

const INITIAL_BOX_WIDTH = 200
const BOX_HEIGHT = 30
const INITIAL_BOX_Y = 600

const INITIAL_Y_SPEED = 5
const INITIAL_X_SPEED = 2

let boxes = []
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed

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

	if (mode === STATES.START) {
		moveAndCollision()
	} else if (mode === STATES.PLAYING) {
		updatePlayingMode()
	}

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
		y: (current + 10) * 50,
		width: boxes[current - 1].width,
		color: 'blue',
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
	const lastBox = boxes[current - 1]

	if (boxes[current].y === lastBox.y + BOX_HEIGHT) {
		handleBoxLanding()
	}
}

function handleBoxLanding() {
	const currentBox = boxes[current]
	const lastBox = boxes[current - 1]

	const diff = currentBox.x - lastBox.x

	if (Math.abs(diff) >= currentBox.width) {
		drawGameOver()
		return
	}

	if (diff > 0) {
		currentBox.width -= diff
	} else {
		currentBox.x = lastBox.x
		currentBox.width += diff
	}

	xSpeed += xSpeed > 0 ? 1 : -1
	current++
	scrollCounter = BOX_HEIGHT
	mode = STATES.START

	score.textContent = current - 1

	createNewBox()
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
	if(mode === STATES.GAMEOVER) {
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
