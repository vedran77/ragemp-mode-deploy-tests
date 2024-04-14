//Start to carry a player on call
element.alpha = 0;
player.setVariable('carry', element.id);
Animations.apply(player, 'missfinale_c2mcs_1', 'fin_c2_mcs_1_camman', 49);
Animations.apply(element, 'nm', 'firemans_carry', 33);
Animations.disableControl(element);

//Stop carrying a player on call
element.alpha = 255;
player.setVariable('carry', undefined);
element.position = player.position;
Animations.clearTasks(element);
Animations.clearTasks(player);
Animations.enableControl(element);

/*
  Animations.enableControl / Animations.disableControl is using: mp.game.controls.disableAllControlActions(0);
  Animations.apply is applying the animation to the given ped with given flags.
  Alpha of the players has to be set because of the cloned-ped spawned when start carrying.
*/
