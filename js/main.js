const spawn_left = 36;
const spawn_top = 25;
let player_left = 0;
let player_top = 0;
let button_left = false;
let button_right = false;
let button_up = false;
let button_down = false;
let speed_mod = 1;
const speed_base = 2.5;
let toggle_hud = false;
let has_key = false;
let box_1_broken = false;
let box_2_broken = false;
let box_3_broken = false;
let box_1_tracking = 0;
let box_2_tracking = 0;
let box_3_tracking = 0;
let box_1_timer = true;
let box_2_timer = true;
let box_3_timer = true;
const audio1 = new Audio(src = "assets/sounds/multimedia_button_click.mp3");
const audio2 = new Audio(src = "assets/sounds/servo_motor_3.mp3");
const audio3 = new Audio(src = "assets/sounds/fs_mud_02.WAV");
const audio4 = new Audio(src = "assets/sounds/footstep Right.mp3");
const lobby_sound = new Audio(src = "assets/sounds/Loop 1.mp3");
const game_sound_lvl1 = new Audio(src = "assets/sounds/Loop 2.mp3");
const game_sound_lvl2 = new Audio(src = "assets/sounds/Loop 3.mp3");
let key_counter = 0;
let boost_counter = 0;
let exit_counter = 0;
let toggle_sound = true;
let devKey1 = false;
let devKey2 = false;

document.addEventListener("DOMContentLoaded", function () {
    const selectedDiff = localStorage.getItem('selectedDiff');
    if (selectedDiff) {
        document.getElementById(selectedDiff).checked = true;
        switch (selectedDiff) {
            case ('radioDiff1'):
                difficulty_cheater()
                break;
            case ('radioDiff2'):
                difficulty_easy()
                break;
            case ('radioDiff3'):
                difficulty_normal()
                break;
            case ('radioDiff4'):
                difficulty_hard()
                break;
            case ('radioDiff5'):
                difficulty_hobbylos()
                break;
        }
    }

    const musicVolumeSlider = document.getElementById("musicVolume");
    const effectVolumeSlider = document.getElementById("effectVolume");
    let music_volume = 0.5;
    let effect_volume = 0.5;

    musicVolumeSlider.addEventListener("input", function () {
        music_volume = musicVolumeSlider.value / 10;
        localStorage.setItem("music_volume", music_volume);
    });

    effectVolumeSlider.addEventListener("input", function () {
        effect_volume = effectVolumeSlider.value / 10;
        localStorage.setItem("effect_volume", effect_volume);
    });

    const savedMusicVolume = localStorage.getItem("music_volume");
    const savedEffectVolume = localStorage.getItem("effect_volume");
    if (savedMusicVolume) {
        musicVolumeSlider.value = savedMusicVolume * 10;
        music_volume = savedMusicVolume;
    }
    if (savedEffectVolume) {
        effectVolumeSlider.value = savedEffectVolume * 10;
        effect_volume = savedEffectVolume;
    }

    toggleTitleScreen();

    updateMusicVolume(music_volume);
    updateEffectVolume(effect_volume);
});

$(document).ready(function () {
    setPlayerSpawn();
    $(document).keydown(function (event) {
        if (event.which === 37 || event.which === 65) {   // Pfeil links oder A
            button_left = true;
        }
        if (event.which === 38 || event.which === 87) {   // Pfeil oben oder W
            button_up = true;
        }
        if (event.which === 39 || event.which === 68) {   // Pfeil rechts oder D
            button_right = true;
        }
        if (event.which === 40 || event.which === 83) {   // Pfeil unten oder S
            button_down = true;
        }


        if (event.which === 60) {
            devKey1 = true;
        }
        if (event.which === 16) {
            devKey2 = true;
        }
        if (devKey1 === true && devKey2 === true) {   // Shift + '<' => Dev-Mode
            if (toggle_hud === true) {
                $(".hud").hide();
                $(".player").css("border", "none");
                toggle_hud = false;
            } else {
                $(".hud").show();
                $(".player").css("border", "1px dashed black");
                toggle_hud = true;
            }
        }

        const musicVolumeSlider = document.getElementById("musicVolume");
        const effectVolumeSlider = document.getElementById("effectVolume");
        const savedMusicVolume = localStorage.getItem("music_volume");
        const savedEffectVolume = localStorage.getItem("effect_volume");
        if (event.which === 77) {   // 'M' => Stumm schalten
            if (toggle_sound === true) {
                toggle_sound = false;
                updateMusicVolume(0)
                musicVolumeSlider.value = 0;
                updateEffectVolume(0)
                effectVolumeSlider.value = 0;
            } else {
                toggle_sound = true;
                updateMusicVolume(localStorage.getItem("music_volume"))
                musicVolumeSlider.value = savedMusicVolume * 10;
                updateEffectVolume(localStorage.getItem("effect_volume"))
                effectVolumeSlider.value = savedEffectVolume * 10;
            }
        }

        if (event.which === 84) {   // 'T' => Einstellungen
            if ($('.settingsPopup').css('display') === 'none') {
                toggleSettings()
            } else {
                exitSettings()
            }
        }
    });
    $(document).keyup(function (event) {
        if (event.which === 37 || event.which === 65) {
            button_left = false;
        }
        if (event.which === 38 || event.which === 87) {
            button_up = false;
        }
        if (event.which === 39 || event.which === 68) {
            button_right = false;
        }
        if (event.which === 40 || event.which === 83) {
            button_down = false;
        }

        if (event.which === 60) {
            devKey1 = false;
        }
        if (event.which === 16) {
            devKey2 = false;
        }
    });

    startGameLoop();
});

function startGameLoop() {
    setInterval(function () {
        checkPlayerMovement();
        drawHud();
    }, (1000 / 30));
}

function checkPlayerMovement() {
    let move_is_valid;
    const distance = speed_base * speed_mod;
    let future_left = player_left;
    let future_top = player_top;
    if (button_left) {
        future_left = player_left - distance;
        future_top = player_top;
        removeDirection();
        $(".player").addClass("look-left");
    }
    if (button_up) {
        future_left = player_left;
        future_top = player_top - distance;
        removeDirection();
        $(".player").addClass("look-up");
    }
    if (button_right) {
        future_left = player_left + distance;
        future_top = player_top;
        removeDirection();
        $(".player").addClass("look-right");
    }
    if (button_down) {
        future_left = player_left;
        future_top = player_top + distance;
        removeDirection();
        $(".player").addClass("look-down");
    }

    if (button_left || button_up || button_down || button_right) {
        $(".player img").hide();
        $(".player video").show();
        move_is_valid = true;
        $(".wall").each(function (index) {
            const wall_top = $(this).css("top");
            const wall_left = $(this).css("left");
            const wall_width = $(this).css("width");
            const wall_height = $(this).css("height");
        });
    } else {
        $(".player img").show();
        $(".player video").hide();
    }

    //Basics
    if ((future_left <= 23) || (future_left >= 969) || (future_top <= 24) || (future_top >= 712)) {
        move_is_valid = false;
    }

    //Level-1
    if (exit_counter === 0) {

        if ((future_left >= 420) && (future_left <= 469) && (future_top >= 0) && (future_top <= 198)) {
            move_is_valid = false;
        } else if ((future_left >= 670) && (future_left <= 1000) && (future_top >= 420) && (future_top <= 468)) {
            move_is_valid = false;
        } else if ((future_left >= 0) && (future_left <= 148) && (future_top >= 105) && (future_top <= 153)) {
            move_is_valid = false;
        } else if ((future_left >= 0) && (future_left <= 398) && (future_top >= 430) && (future_top <= 480)) {
            move_is_valid = false;
        } else if ((future_left >= 270) && (future_left <= 318) && (future_top >= 460) && (future_top <= 600)) {
            move_is_valid = false;
        } else if ((future_left >= 670) && (future_left <= 718) && (future_top >= 70) && (future_top <= 370)) {
            move_is_valid = false;
        } else if ((future_left >= 490) && (future_left <= 538) && (future_top >= 270) && (future_top <= 650)) {
            move_is_valid = false;
        } else if ((future_left >= 120) && (future_left <= 348) && (future_top >= 260) && (future_top <= 310)) {
            move_is_valid = false;
        } else if ((future_left >= 916) && (future_left <= 996) && (future_top >= 473) && (future_top <= 601)) {
            move_is_valid = false;
        } else if ((future_left >= 437) && (future_left <= 517) && (future_top >= 298) && (future_top <= 426)) {
            move_is_valid = false;
        } else if ((future_left >= 482) && (future_left <= 546) && (future_top >= 667) && (future_top <= 705)) {

            if (box_1_broken) move_is_valid = true;
            else {
                move_is_valid = false;
                if (box_1_timer === true) {
                    box_1_timer = false;
                    setTimeout(function () {
                        box_1_timer = true;
                    }, 600)

                    if (box_1_tracking === 0) {
                        box_1_tracking = 1;
                        $('.box-1').addClass('broken-box-1')
                        crash_sound();
                    } else if (box_1_tracking === 1) {
                        box_1_tracking = 2;
                        $('.box-1').addClass('broken-box-2')
                        removeBroken_1()
                        crash_sound();
                    } else if (box_1_tracking === 2) {
                        box_1_tracking = 3;
                        $('.box-1').addClass('broken-box-3')
                        removeBroken_2()
                        crash_sound();
                    } else if (box_1_tracking === 3) {
                        box_1_tracking = 4;
                        $(".broken-box-3").hide();
                        box_1_broken = true;
                        crash_sound();
                    }
                }
            }
        } else if ((future_left >= 482) && (future_left <= 546) && (future_top >= 607) && (future_top <= 670)) {

            if (box_2_broken) move_is_valid = true;
            else {
                move_is_valid = false;
                if (box_2_timer === true) {
                    box_2_timer = false;
                    setTimeout(function () {
                        box_2_timer = true;
                    }, 6000)

                    if (box_2_tracking === 0) {
                        box_2_tracking = 1;
                        $('.box-2').addClass('broken-box-1')
                        crash_sound();
                    } else if (box_2_tracking === 1) {
                        box_2_tracking = 2;
                        $('.box-2').addClass('broken-box-2')
                        removeBroken_1()
                        crash_sound();

                    } else if (box_2_tracking === 2) {
                        box_2_tracking = 3;
                        $('.box-2').addClass('broken-box-3')
                        removeBroken_2()
                        crash_sound();
                    } else if (box_2_tracking === 3) {
                        box_2_tracking = 4;
                        $(".broken-box-3").hide();
                        box_2_broken = true;
                        crash_sound();
                    }
                }
            }
        } else if ((future_left >= 20) && (future_left <= 60) && (future_top >= 178) && (future_top <= 240)) {

            if (box_3_broken) move_is_valid = true;
            else {
                move_is_valid = false;
                if (box_3_timer === true) {
                    box_3_timer = false;
                    setTimeout(function () {
                        box_3_timer = true;
                    }, 600)

                    if (box_3_tracking === 0) {
                        box_3_tracking = 1;
                        $('.box-3').addClass('broken-box-1')
                        crash_sound();
                    } else if (box_3_tracking === 1) {
                        box_3_tracking = 2;
                        $('.box-3').addClass('broken-box-2')
                        removeBroken_1()
                        crash_sound();
                    } else if (box_3_tracking === 2) {
                        box_3_tracking = 3;
                        $('.box-3').addClass('broken-box-3')
                        removeBroken_2()
                        crash_sound();
                    } else if (box_3_tracking === 3) {
                        box_3_tracking = 4;
                        $(".broken-box-3").hide();
                        box_3_broken = true;
                        crash_sound();
                    }
                }
            }
        }
        if (move_is_valid) setPlayerPosition(future_left, future_top);

        if (speed_mod) {
            if ((future_left >= 24) && (future_left <= 58) && (future_top >= 481) && (future_top <= 514) && ($(".boost").hasClass("show"))) {
                speed_mod += speed_mod * 0.5;
                $(".boost").removeClass("show");
                $(".chest-2").addClass("chest-open");
                boost_counter++
                boostCounter()
            } else if ((future_left >= 968) && (future_left <= 996) && (future_top >= 25) && (future_top <= 59)) {
                $(".key").removeClass("show");
                $(".chest-1").addClass("chest-open");
                has_key = true;
                if (has_key === true) {
                    key_counter++
                    keyCounter()
                }
            } else if ((future_left >= 964) && (future_left <= 1024) && (future_top >= 696) && (future_top <= 756) && (has_key === true)) {
                $('.door-exit').addClass('door-open');
                exit_counter++
                toggleLevel2()
            }
        }

        //Level-2
        else if (exit_counter === 1) {
        }
    }
}

function toggleTitleScreen() {
    $(".title-screen").show();
    toggleMusicLobby()
}

function toggleLevel1() {
    $(".level-1").show();
    $(".basics").show();
    $(".title-screen").hide();
    toggleMusicLvl1()
}

function toggleLevel2() {
    $(".level-2").show();
    $('.door-entrance').addClass('door-closed');
    exit_sound()
}

function toggleSettings() {
    $(".settingsPopup").show();
}

function exitSettings() {
    $(".settingsPopup").hide();
}

function difficulty_cheater() {
    (speed_mod = 4)
    collect_sound();
    localStorage.setItem('selectedDiff', 'radioDiff1');
    console.log('Schwierigkeit gesetzt: ZU EINFACH');
}

function difficulty_easy() {
    (speed_mod = 3)
    collect_sound();
    localStorage.setItem('selectedDiff', 'radioDiff2');
    console.log('Schwierigkeit gesetzt: EINFACH');
}

function difficulty_normal() {
    (speed_mod = 2)
    collect_sound();
    localStorage.setItem('selectedDiff', 'radioDiff3');
    console.log('Schwierigkeit gesetzt: NORMAL');
}

function difficulty_hard() {
    (speed_mod = 1)
    collect_sound();
    localStorage.setItem('selectedDiff', 'radioDiff4');
    console.log('Schwierigkeit gesetzt: SCHWER');
}

function difficulty_hobbylos() {
    (speed_mod = 0.5)
    collect_sound();
    localStorage.setItem('selectedDiff', 'radioDiff5');
    console.log('Schwierigkeit gesetzt: HOBBYLOS');
}

function boostCounter() {
    if (boost_counter === 1)
        collect_sound()
}

function keyCounter() {
    if (key_counter === 1)
        collect_sound()
}

function updateMusicVolume(music_volume) {
    game_sound_lvl1.volume = music_volume;
    lobby_sound.volume = music_volume;
}

function updateEffectVolume(effect_volume) {
    audio1.volume = effect_volume;
    audio2.volume = effect_volume;
    audio3.volume = effect_volume;
}

function collect_sound() {
    audio1.play();
    audio1.loop = false;
}

function exit_sound() {
    audio2.play();
    audio2.loop = false;
}

function crash_sound() {
    audio3.play();
    audio3.loop = false;
}

function footstep_sound() {
    audio4.play();
    audio4.loop = false;
}

function toggleMusicLvl1() {
    game_sound_lvl1.play();
    game_sound_lvl1.loop = true;
}

function untoggleMusicLvl1() {
    game_sound_lvl1.stop();
}

function toggleMusicLobby() {
    lobby_sound.play();
    lobby_sound.loop = true;
}

function untoggleMusicLobby() {
    lobby_sound.stop();
}

function removeBroken_1() {
    $(".box-1,.box-2,.box-3").removeClass("broken-box-1");
}

function removeBroken_2() {
    $(".box-1,.box-2,.box-3").removeClass("broken-box-2");
}

function removeDirection() {
    $(".player").removeClass("look-down");
    $(".player").removeClass("look-up");
    $(".player").removeClass("look-left");
    $(".player").removeClass("look-right");
}

function setPlayerSpawn() {
    setPlayerPosition(spawn_left, spawn_top);
}

function setPlayerPosition(left, top) {
    $("#player").css("top", top + "px");
    $("#player").css("left", left + "px");
    player_left = left;
    player_top = top;
}

function drawHud() {
    $("#hud_left").empty().append("left:" + player_left);
    $("#hud_top").empty().append("top:" + player_top);
    $("#hud_speed").empty().append("speed:" + speed_mod);
    $("#hud_key").empty().append("key:" + has_key);
    $("#hud_sound").empty().append("sound:" + toggle_sound);
}