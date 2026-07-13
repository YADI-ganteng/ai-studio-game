extends KinematicBody2D

# Character properties
var char_name = "Naruto"
var level = 1
var max_hp = 500.0
var hp = 500.0
var max_chakra = 200.0
var chakra = 200.0
var attack_power = 50.0
var defense = 20.0
var speed = 200.0

# Cooldowns
var attack_cooldown = 0.0
var skill1_cooldown = 0.0
var skill2_cooldown = 0.0
var ultimate_cooldown = 0.0

# States
var is_attacking = false
var is_jumping = false
var is_dashing = false
var is_dead = false

# References
var target = null
var velocity = Vector2.ZERO

func _ready():
    # Create character sprite
    var sprite = ColorRect.new()
    sprite.color = get_character_color()
    sprite.rect_size = Vector2(40, 60)
    sprite.rect_position = Vector2(-20, -30)
    add_child(sprite)
    
    # Name label
    var label = Label.new()
    label.text = char_name
    label.rect_position = Vector2(-30, -50)
    add_child(label)
    
    # Health bar
    update_health_bar()

func get_character_color():
    match char_name:
        "Naruto": return Color.orange
        "Sasuke": return Color(0.3, 0.3, 0.8)
        "Sakura": return Color(1, 0.4, 0.7)
        "Kakashi": return Color(0.5, 0.5, 0.5)
    return Color.white

func _process(delta):
    # Update cooldowns
    attack_cooldown = max(0, attack_cooldown - delta)
    skill1_cooldown = max(0, skill1_cooldown - delta)
    skill2_cooldown = max(0, skill2_cooldown - delta)
    ultimate_cooldown = max(0, ultimate_cooldown - delta)
    
    # Regenerate chakra
    chakra = min(max_chakra, chakra + 10 * delta)
    
    # Move
    if not is_dashing and not is_attacking:
        move_and_slide(velocity)

func attack():
    if attack_cooldown > 0 or is_attacking:
        return
    
    is_attacking = true
    attack_cooldown = 0.5
    
    # Attack animation
    var tween = create_tween()
    tween.tween_property(self, "position:x", position.x + 30, 0.1)
    tween.tween_callback(self, "_on_attack_hit")
    tween.tween_property(self, "position:x", position.x, 0.1)
    tween.tween_callback(self, "_on_attack_end")

func _on_attack_hit():
    if target and target.has_method("take_damage"):
        target.take_damage(attack_power)

func _on_attack_end():
    is_attacking = false

func skill1():
    if skill1_cooldown > 0 or chakra < 30:
        return
    
    chakra -= 30
    skill1_cooldown = 3.0
    
    # Skill effect
    var effect = ColorRect.new()
    effect.color = Color.yellow
    effect.rect_size = Vector2(50, 50)
    effect.rect_position = Vector2(-25, -25)
    add_child(effect)
    
    var tween = create_tween()
    tween.tween_property(effect, "modulate:a", 0, 0.5)
    tween.tween_callback(effect, "queue_free")
    
    if target and target.has_method("take_damage"):
        target.take_damage(attack_power * 1.5)

func skill2():
    if skill2_cooldown > 0 or chakra < 50:
        return
    
    chakra -= 50
    skill2_cooldown = 5.0
    
    if target and target.has_method("take_damage"):
        target.take_damage(attack_power * 2.0)

func ultimate():
    if ultimate_cooldown > 0 or chakra < 100:
        return
    
    chakra -= 100
    ultimate_cooldown = 10.0
    
    # Screen flash
    var flash = ColorRect.new()
    flash.color = Color(1, 1, 1, 0.5)
    flash.rect_size = get_viewport().size
    get_parent().add_child(flash)
    
    var tween = create_tween()
    tween.tween_property(flash, "modulate:a", 0, 0.3)
    tween.tween_callback(flash, "queue_free")
    
    if target and target.has_method("take_damage"):
        target.take_damage(attack_power * 3.0)

func take_damage(damage):
    var actual_damage = max(1, damage - defense)
    hp -= actual_damage
    
    # Damage text
    var dmg_label = Label.new()
    dmg_label.text = "-" + str(int(actual_damage))
    dmg_label.rect_position = Vector2(-20, -60)
    dmg_label.add_color_override("font_color", Color.red)
    add_child(dmg_label)
    
    var tween = create_tween()
    tween.tween_property(dmg_label, "rect_position:y", -100, 0.5)
    tween.parallel().tween_property(dmg_label, "modulate:a", 0, 0.5)
    tween.tween_callback(dmg_label, "queue_free")
    
    if hp <= 0:
        hp = 0
        is_dead = true
        die()

func die():
    var tween = create_tween()
    tween.tween_property(self, "modulate:a", 0, 0.5)
    tween.tween_callback(self, "queue_free")

func jump():
    if is_jumping:
        return
    is_jumping = true
    
    var tween = create_tween()
    tween.tween_property(self, "position:y", position.y - 100, 0.3)
    tween.tween_property(self, "position:y", position.y, 0.3)
    tween.tween_callback(self, "_on_jump_end")

func _on_jump_end():
    is_jumping = false

func dash():
    if is_dashing or chakra < 20:
        return
    
    chakra -= 20
    is_dashing = true
    
    var tween = create_tween()
    tween.tween_property(self, "position:x", position.x + 100, 0.2)
    tween.tween_callback(self, "_on_dash_end")

func _on_dash_end():
    is_dashing = false

func move(direction):
    velocity = direction * speed

func set_target(t):
    target = t

func get_hp_percent():
    return hp / max_hp

func update_health_bar():
    pass
