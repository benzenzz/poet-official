// Site-wide motion layer (story scroll, numbers, gentle reveals). Owns no content:
// every page reads complete without it, and the head script only hides things
// for full motion (html.m-js), dropping that class itself after 3s if this file never runs.
import {initStories} from './story.mjs?v=anim-2';
import {initNumbers} from './numbers.mjs?v=anim-2';
import {initReveals} from './reveal.mjs?v=anim-2';
import {initPageWave} from './page-wave.mjs?v=anim-4';

const root=document.documentElement;
initPageWave();
const full=root.classList.contains('m-js');
root.classList.add('m-ready',full?'m-full':'m-reduced');
initStories({full});
if(full){initNumbers();initReveals();}
