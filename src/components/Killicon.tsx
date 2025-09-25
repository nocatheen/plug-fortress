import air_strike from "/src/assets/killicon/air_strike.png";
import baby_faces_blaster from "/src/assets/killicon/baby_faces_blaster.png";
import bat from "/src/assets/killicon/bat.png";
import bazaar_bargain from "/src/assets/killicon/bazaar_bargain.png";
import bonesaw from "/src/assets/killicon/bonesaw.png";
import bottle from "/src/assets/killicon/bottle.png";
import classic from "/src/assets/killicon/classic.png";
import cleaners_carbine from "/src/assets/killicon/cleaners_carbine.png";
import cow_mangler_5000 from "/src/assets/killicon/cow_mangler_5000.png";
import crusaders_crossbow from "/src/assets/killicon/crusaders_crossbow.png";
import direct_hit from "/src/assets/killicon/direct_hit.png";
import dragons_fury from "/src/assets/killicon/dragons_fury.png";
import eyelander from "/src/assets/killicon/eyelander.png";
import fire_axe from "/src/assets/killicon/fire_axe.png";
import fists from "/src/assets/killicon/fists.png";
import flame_thrower from "/src/assets/killicon/flame_thrower.png";
import flare_gun from "/src/assets/killicon/flare_gun.png";
import flying_guillotine from "/src/assets/killicon/flying_guillotine.png";
import frontier_justice from "/src/assets/killicon/frontier_justice.png";
import grenade_launcher from "/src/assets/killicon/grenade_launcher.png";
import gunslinger from "/src/assets/killicon/gunslinger.png";
import half_zatoichi from "/src/assets/killicon/half_zatoichi.png";
import holy_mackerel from "/src/assets/killicon/holy_mackerel.png";
import hot_hand from "/src/assets/killicon/hot_hand.png";
import huntsman from "/src/assets/killicon/huntsman.png";
import knife from "/src/assets/killicon/knife.png";
import kukri from "/src/assets/killicon/kukri.png";
import loose_cannon from "/src/assets/killicon/loose_cannon.png";
import minigun from "/src/assets/killicon/minigun.png";
import neon_annihilator from "/src/assets/killicon/neon_annihilator.png";
import pistol from "/src/assets/killicon/pistol.png";
import pretty_boys_pocket_pistol from "/src/assets/killicon/pretty_boys_pocket_pistol.png";
import rescue_ranger from "/src/assets/killicon/rescue_ranger.png";
import revolver from "/src/assets/killicon/revolver.png";
import righteous_bison from "/src/assets/killicon/righteous_bison.png";
import rocket_launcher from "/src/assets/killicon/rocket_launcher.png";
import sandman from "/src/assets/killicon/sandman.png";
import scattergun from "/src/assets/killicon/scattergun.png";
import shortstop from "/src/assets/killicon/shortstop.png";
import short_circuit from "/src/assets/killicon/short_circuit.png";
import shotgun from "/src/assets/killicon/shotgun.png";
import shovel from "/src/assets/killicon/shovel.png";
import skull from "/src/assets/killicon/skull.png";
import SMG from "/src/assets/killicon/SMG.png";
import sniper_rifle from "/src/assets/killicon/sniper_rifle.png";
import soda_popper from "/src/assets/killicon/soda_popper.png";
import stickybomb_launcher from "/src/assets/killicon/stickybomb_launcher.png";
import syringe_gun from "/src/assets/killicon/syringe_gun.png";
import wrangler from "/src/assets/killicon/wrangler.png";
import wrap_assassin from "/src/assets/killicon/wrap_assassin.png";
import wrench from "/src/assets/killicon/wrench.png";

function parseIcon(icon: string) {
  switch (icon) {
    case "scattergun":
      return scattergun;
    case "handgun_scout_primary":
      return shortstop;
    case "soda_popper":
      return soda_popper;
    case "pep_brawler_blaster":
      return baby_faces_blaster;
    case "pistol_scout":
      return pistol;
    case "handgun_scout_secondary":
      return pretty_boys_pocket_pistol;
    case "cleaver":
      return flying_guillotine;
    case "bat":
      return bat;
    case "bat_fish":
      return holy_mackerel;
    case "bat_wood":
      return sandman;
    case "bat_giftwrap":
      return wrap_assassin;
    case "rocketlauncher":
      return rocket_launcher;
    case "rocketlauncher_directhit":
      return direct_hit;
    case "particle_cannon":
      return cow_mangler_5000;
    case "rocketlauncher_airstrike":
      return air_strike;
    case "shotgun_soldier":
      return shotgun;
    case "raygun":
      return righteous_bison;
    case "shovel":
      return shovel;
    case "katana":
      return half_zatoichi;
    case "flamethrower":
      return flame_thrower;
    case "rocketlauncher_fireball":
      return dragons_fury;
    case "shotgun_pyro":
      return shotgun;
    case "flaregun":
      return flare_gun;
    case "fireaxe":
      return fire_axe;
    case "breakable_sign":
      return neon_annihilator;
    case "slap":
      return hot_hand;
    case "grenadelauncher":
      return grenade_launcher;
    case "cannon":
      return loose_cannon;
    case "bottle":
      return bottle;
    case "sword":
      return eyelander;
    case "stickbomb":
      return stickybomb_launcher;
    case "minigun":
      return minigun;
    case "shotgun_hwg":
      return shotgun;
    case "fists":
      return fists;
    case "shotgun_primary":
      return shotgun;
    case "sentry_revenge":
      return frontier_justice;
    case "shotgun_building_rescue":
      return rescue_ranger;
    case "pistol":
      return pistol;
    case "laser_pointer":
      return wrangler;
    case "mechanical_arm":
      return short_circuit;
    case "wrench":
      return wrench;
    case "robot_arm":
      return gunslinger;
    case "syringegun_medic":
      return syringe_gun;
    case "crossbow":
      return crusaders_crossbow;
    case "bonesaw":
      return bonesaw;
    case "sniperrifle":
      return sniper_rifle;
    case "compound_bow":
      return huntsman;
    case "sniperrifle_decap":
      return bazaar_bargain;
    case "sniperrifle_classic":
      return classic;
    case "smg":
      return SMG;
    case "charged_smg":
      return cleaners_carbine;
    case "club":
      return kukri;
    case "revolver":
      return revolver;
    case "knife":
      return knife;
    default:
      return skull;
  }
}

export function Killicon({ icon }: { icon: string }) {
  return <img src={parseIcon(icon)} />;
}
