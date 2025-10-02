import air_strike from "/src/assets/killicon/air_strike.png";
import ambassador from "/src/assets/killicon/ambassador.png";
import baby_faces_blaster from "/src/assets/killicon/baby_faces_blaster.png";
import backburner from "/src/assets/killicon/backburner.png";
import backstab from "/src/assets/killicon/backstab.png";
import bat from "/src/assets/killicon/bat.png";
import bazaar_bargain from "/src/assets/killicon/bazaar_bargain.png";
import big_earner from "/src/assets/killicon/big_earner.png";
import black_box from "/src/assets/killicon/black_box.png";
import bleed from "/src/assets/killicon/bleed.png";
import bottle from "/src/assets/killicon/bottle.png";
import brass_beast from "/src/assets/killicon/brass_beast.png";
import chargin_targe from "/src/assets/killicon/chargin_targe.png";
import claidheamh_mГIr from "/src/assets/killicon/claidheamh_mГIr.png";
import connivers_kunai from "/src/assets/killicon/connivers_kunai.png";
import crusaders_crossbow from "/src/assets/killicon/crusaders_crossbow.png";
import degreaser from "/src/assets/killicon/degreaser.png";
import detonator from "/src/assets/killicon/detonator.png";
import diamondback from "/src/assets/killicon/diamondback.png";
import direct_hit from "/src/assets/killicon/direct_hit.png";
import dragons_fury from "/src/assets/killicon/dragons_fury.png";
import dragons_fury_afterburn from "/src/assets/killicon/dragons_fury_afterburn.png";
import equalizer from "/src/assets/killicon/equalizer.png";
import escape_plan from "/src/assets/killicon/escape_plan.png";
import eureka_effect from "/src/assets/killicon/eureka_effect.png";
import eyelander from "/src/assets/killicon/eyelander.png";
import family_business from "/src/assets/killicon/family_business.png";
import flame_thrower from "/src/assets/killicon/flame_thrower.png";
import flare_gun from "/src/assets/killicon/flare_gun.png";
import frontier_justice from "/src/assets/killicon/frontier_justice.png";
import frying_pan from "/src/assets/killicon/frying_pan.png";
import gloves_of_running_urgently from "/src/assets/killicon/gloves_of_running_urgently.png";
import grenade_launcher from "/src/assets/killicon/grenade_launcher.png";
import gunslinger from "/src/assets/killicon/gunslinger.png";
import half_zatoichi from "/src/assets/killicon/half_zatoichi.png";
import hitmans_heatmaker from "/src/assets/killicon/hitmans_heatmaker.png";
import huntsman from "/src/assets/killicon/huntsman.png";
import huntsmanhs from "/src/assets/killicon/huntsmanhs.png";
import iron_bomber from "/src/assets/killicon/iron_bomber.png";
import iron_curtain from "/src/assets/killicon/iron_curtain.png";
import jag from "/src/assets/killicon/jag.png";
import knife from "/src/assets/killicon/knife.png";
import letranger from "/src/assets/killicon/letranger.png";
import liberty_launcher from "/src/assets/killicon/liberty_launcher.png";
import loch_n_load from "/src/assets/killicon/loch_n_load.png";
import loose_cannon from "/src/assets/killicon/loose_cannon.png";
import loose_cannon_pushed from "/src/assets/killicon/loose_cannon_pushed.png";
import machina from "/src/assets/killicon/machina.png";
import market_gardener from "/src/assets/killicon/market_gardener.png";
import minigun from "/src/assets/killicon/minigun.png";
import minisentry from "/src/assets/killicon/minisentry.png";
import natascha from "/src/assets/killicon/natascha.png";
import nessies_nine_iron from "/src/assets/killicon/nessies_nine_iron.png";
import original from "/src/assets/killicon/original.png";
import panic_attack from "/src/assets/killicon/panic_attack.png";
import persian_persuader from "/src/assets/killicon/persian_persuader.png";
import phlogistinator from "/src/assets/killicon/phlogistinator.png";
import pistol from "/src/assets/killicon/pistol.png";
import quickiebomb_launcher from "/src/assets/killicon/quickiebomb_launcher.png";
import rescue_ranger from "/src/assets/killicon/rescue_ranger.png";
import revolver from "/src/assets/killicon/revolver.png";
import rocket_launcher from "/src/assets/killicon/rocket_launcher.png";
import scattergun from "/src/assets/killicon/scattergun.png";
import scorch_shot from "/src/assets/killicon/scorch_shot.png";
import scotsmans_skullcutter from "/src/assets/killicon/scotsmans_skullcutter.png";
import scottish_handshake from "/src/assets/killicon/scottish_handshake.png";
import scottish_resistance from "/src/assets/killicon/scottish_resistance.png";
import sentry1 from "/src/assets/killicon/sentry1.png";
import sentry2 from "/src/assets/killicon/sentry2.png";
import sentry3 from "/src/assets/killicon/sentry3.png";
import shotgun from "/src/assets/killicon/shotgun.png";
import shovel from "/src/assets/killicon/shovel.png";
import skull from "/src/assets/killicon/skull.png";
import SMG from "/src/assets/killicon/SMG.png";
import sniperriflehs from "/src/assets/killicon/sniperriflehs.png";
import sniper_rifle from "/src/assets/killicon/sniper_rifle.png";
import soda_popper from "/src/assets/killicon/soda_popper.png";
import solemn_vow from "/src/assets/killicon/solemn_vow.png";
import spy_cicle from "/src/assets/killicon/spy_cicle.png";
import stickybomb_launcher from "/src/assets/killicon/stickybomb_launcher.png";
import sydney_sleeper from "/src/assets/killicon/sydney_sleeper.png";
import tomislav from "/src/assets/killicon/tomislav.png";
import ubersaw from "/src/assets/killicon/ubersaw.png";
import ullapool_caber_explode from "/src/assets/killicon/ullapool_caber_explode.png";
import widowmaker from "/src/assets/killicon/widowmaker.png";
import your_eternal_reward from "/src/assets/killicon/your_eternal_reward.png";

function parseIcon(icon: string, crit: boolean) {
  if (crit) {
    switch (icon) {
      case "knife":
        return backstab;
      case "sniperrifle":
        return sniperriflehs;
      case "spy_cicle":
        return backstab;
      case "kunai":
        return backstab;
      case "big_earner":
        return backstab;
      case "tf_projectile_arrow":
        return huntsmanhs;
    }
  }

  switch (icon) {
    case "scattergun":
      return scattergun;
    case "panic_attack":
      return panic_attack;
    case "airstrike":
      return air_strike;
    case "revolver":
      return revolver;
    case "pep_brawlerblaster":
      return baby_faces_blaster;
    case "knife":
      return knife;
    case "awper_hand":
      return sniper_rifle;
    case "eternal_reward":
      return your_eternal_reward;
    case "quickiebomb_launcher":
      return quickiebomb_launcher;
    case "demokatana":
      return half_zatoichi;
    case "obj_sentrygun":
      return sentry1;
    case "obj_sentrygun2":
      return sentry2;
    case "obj_sentrygun3":
      return sentry3;
    case "obj_minisentry":
      return minisentry;
    case "quake_rl":
      return original;
    case "iron_bomber":
      return iron_bomber;
    case "tomislav":
      return tomislav;
    case "ubersaw":
      return ubersaw;
    case "sydney_sleeper":
      return sydney_sleeper;
    case "liberty_launcher":
      return liberty_launcher;
    case "ambassador":
      return ambassador;
    case "long_heatmaker":
      return hitmans_heatmaker;
    case "backburner":
      return backburner;
    case "blackbox":
      return black_box;
    case "bleed_kill":
      return bleed;
    case "spy_cicle":
      return spy_cicle;
    case "tf_projectile_pipe":
      return grenade_launcher;
    case "world":
      return skull;
    case "scorch_shot":
      return scorch_shot;
    case "scotland_shard":
      return scottish_handshake;
    case "degreaser":
      return degreaser;
    case "widowmaker":
      return widowmaker;
    case "iron_curtain":
      return iron_curtain;
    case "loch_n_load":
      return loch_n_load;
    case "battleaxe":
      return scotsmans_skullcutter;
    case "phlogistinator":
      return phlogistinator;
    case "crusaders_crossbow":
      return crusaders_crossbow;
    case "rocketlauncher_directhit":
      return direct_hit;
    case "sniperrifle":
      return sniper_rifle;
    case "tf_projectile_rocket":
      return rocket_launcher;
    case "pistol_scout":
      return pistol;
    case "loose_cannon":
      return loose_cannon;
    case "loose_cannon_impact":
      return loose_cannon_pushed;
    case "solemn_vow":
      return solemn_vow;
    case "minigun":
      return minigun;
    case "shotgun_primary":
      return shotgun;
    case "robot_arm":
      return gunslinger;
    case "tf_projectile_pipe_remote":
      return stickybomb_launcher;
    case "bazaar_bargain":
      return bazaar_bargain;
    case "unique_pickaxe_escape":
      return escape_plan;
    case "unique_pickaxe":
      return equalizer;
    case "big_earner":
      return big_earner;
    case "bottle":
      return bottle;
    case "machina":
      return machina;
    case "pistol":
      return pistol;
    case "soda_popper":
      return soda_popper;
    case "tf_projectile_arrow":
      return huntsman;
    case "natascha":
      return natascha;
    case "letranger":
      return letranger;
    case "flamethrower":
      return flame_thrower;
    case "shovel":
      return shovel;
    case "detonator":
      return detonator;
    case "frontier_justice":
      return frontier_justice;
    case "kunai":
      return connivers_kunai;
    case "market_gardener":
      return market_gardener;
    case "eureka_effect":
      return eureka_effect;
    case "diamondback":
      return diamondback;
    case "smg":
      return SMG;
    case "wrench_jag":
      return jag;
    case "shotgun_soldier":
      return shotgun;
    case "shotgun_pyro":
      return shotgun;
    case "claidheamohmor":
      return claidheamh_mГIr;
    case "fryingpan":
      return frying_pan;
    case "telefrag":
      return skull;
    case "sticky_resistance":
      return scottish_resistance;
    case "bat":
      return bat;
    case "persian_persuader":
      return persian_persuader;
    case "nessieclub":
      return nessies_nine_iron;
    case "ullapool_caber_explosion":
      return ullapool_caber_explode;
    case "brass_beast":
      return brass_beast;
    case "family_business":
      return family_business;
    case "sword":
      return eyelander;
    case "flaregun":
      return flare_gun;
    case "dragons_fury":
      return dragons_fury_afterburn;
    case "dragons_fury_bonus":
      return dragons_fury;
    case "rescue_ranger":
      return rescue_ranger;
    case "demoshield":
      return chargin_targe;
    case "gloves_running_urgently":
      return gloves_of_running_urgently;
  }
  return undefined;
}

export function Killicon({ icon, crit }: { icon: string; crit: boolean }) {
  const src = parseIcon(icon, crit);
  if (src) {
    return <img src={src} />;
  } else {
    return icon;
  }
}
