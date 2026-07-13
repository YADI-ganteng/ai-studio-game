extends Node2D

var player1
var player2
var battle_time = 99.0
var is_game_over = false

func _ready():
    # Setup background
    setup_background()
    
    # Create players
    player1 = create_character("Naruto", 1, Vector2(200, 300))
    player2 = create_character("Sasuke", 1, Vector2(600, 300))
    
    # Set targets
    player1.set_target(player2)
    player2.set_target(player1)
    
    # Setup UI
    setup_ui()
    
    # Start AI timer
    var ai_timer = Timer.new()
    ai_timer.wait_time = 0.5
    ai_timer.autostart = true
    ai_timer.connect("timeout", self, "_on_ai_update")
    add_child(ai_timer)

func setup_background():
    # Sky
    var sky = ColorRect.new()
    sky.color = Color(0.4, 0.6, 1.0)
    sky.rect_size = Vector2(800, 360)
    sky.rect_position = Vector2(0, 240)
    add_child(sky)
    
    # Ground
    var ground = ColorRect.new()
    ground.color = Color(0.4, 0.26, 0.13)
    ground.rect_size = Vector2(800, 240)
    add_child(ground)

func create_character(name, level, pos):
    var char_script = load("res://scripts/Character.gd")
    var character = KinematicBody2D.new()
    character.set_script(char_script)
    character.char_name = name
    character.level = level
    character.position = pos
    add_child(character)
    return character

func setup_ui():
    # Timer
    var timer_label = Label.new()
    timer_label.name = "TimerLabel"
    timer_label.rect_position = Vector2(380, 10)
    timer_label.add_color_override("font_color", Color.white)
    add_child(timer_label)
    
    # HP Labels
    var p1_hp = Label.new()
    p1_hp.name = "P1HP"
    p1_hp.rect_position = Vector2(50, 10)
    p1_hp.add_color_override("font_color", Color.green)
    add_child(p1_hp)
    
    var p2_hp = Label.new()
    p2_hp.name = "P2HP"
    p2_hp.rect_position = Vector2(650, 10)
    p2_hp.add_color_override("font_color", Color.red)
    add_child(p2_hp)

func _process(delta):
    if is_game_over:
        return
    
    battle_time -= delta
    if battle_time <= 0:
        battle_time = 0
        check_game_over()
    
    update_ui()

func _on_ai_update():
    if is_game_over or not is_instance_valid(player2):
        return
    
    # Simple AI
    if player1.position.x < player2.position.x:
        player2.move(Vector2.LEFT)
    
    var r = randf()
    if r < 0.3:
        player2.attack()
    elif r < 0.5:
        player2.skill1()
    elif r < 0.7:
        player2.skill2()
    elif r < 0.8:
        player2.ultimate()

func update_ui():
    $TimerLabel.text = str(int(battle_time))
    $P1HP.text = "HP: " + str(int(player1.get_hp_percent() * 100)) + "%"
    $P2HP.text = "HP: " + str(int(player2.get_hp_percent() * 100)) + "%"

func check_game_over():
    is_game_over = true
    
    var winner = "Draw!"
    if not is_instance_valid(player2) or player2.is_dead:
        winner = "You Win!"
    elif not is_instance_valid(player1) or player1.is_dead:
        winner = "You Lose!"
    
    var label = Label.new()
    label.text = winner
    label.rect_position = Vector2(350, 250)
    label.add_color_override("font_color", Color.yellow)
    label.add_font_override("font", load("res://default_font.tres"))
    add_child(label)

# Input handling
func _input(event):
    if is_game_over or not is_instance_valid(player1):
        return
    
    if Input.is_action_just_pressed("attack"):
        player1.attack()
    elif Input.is_action_just_pressed("skill1"):
        player1.skill1()
    elif Input.is_action_just_pressed("skill2"):
        player1.skill2()
    elif Input.is_action_just_pressed("ultimate"):
        player1.ultimate()
    elif Input.is_action_just_pressed("jump"):
        player1.jump()
    elif Input.is_action_just_pressed("dash"):
        player1.dash()
    
    # Movement
    var direction = Vector2.ZERO
    if Input.is_action_pressed("move_left"):
        direction.x -= 1
    if Input.is_action_pressed("move_right"):
        direction.x += 1
    if Input.is_action_pressed("move_up"):
        direction.y -= 1
    if Input.is_action_pressed("move_down"):
        direction.y += 1
    
    if direction != Vector2.ZERO:
        player1.move(direction)
