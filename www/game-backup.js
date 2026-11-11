(function (root) {
  'use strict';
  const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const uint = value => Number.isInteger(value) && value >= 0 && value <= 4294967295;
  function validate(data, engines) {
    const {Flight, Packs, Worlds} = engines;
    let nodes = 0;
    function safe(value, depth = 0) {
      assert(++nodes <= 50000 && depth <= 18, 'This backup is too complex.');
      if (value === null || typeof value === 'boolean') return;
      if (typeof value === 'number') { assert(Number.isFinite(value), 'Invalid number in backup.'); return; }
      if (typeof value === 'string') { assert(value.length <= 12000, 'A saved value is too long.'); return; }
      assert(object(value) || Array.isArray(value), 'Invalid saved value.');
      assert(Object.keys(value).length <= 2000, 'Too many saved values.');
      for (const [key, child] of Object.entries(value)) {
        assert(!['__proto__','prototype','constructor'].includes(key), 'Invalid saved key.');
        safe(child, depth + 1);
      }
    }
    safe(data);
    assert(object(data) && data.version === 1 && object(data.tracks), 'This is not a supported game backup.');
    const worldIDs = Object.keys(Worlds.worlds);
    const skills = ['scheduling','analysis','documentation','database','integrity'];
    assert(worldIDs.includes(data.world) && skills.includes(data.activeSkill), 'Unknown saved world or specialty.');
    assert(typeof data.sound === 'boolean' && (data.haptics === undefined || typeof data.haptics === 'boolean'), 'Invalid game preferences.');
    assert(Object.keys(data.tracks).length <= 20, 'Too many saved tracks.');

    function shape(value, initial) {
      if (initial === null) { assert(value === null || ['string','number','boolean'].includes(typeof value), 'Invalid answer shape.'); return; }
      if (Array.isArray(initial)) { assert(Array.isArray(value), 'Invalid answer list.'); return; }
      if (object(initial)) {
        assert(object(value), 'Invalid answer record.');
        for (const [key, child] of Object.entries(initial)) { assert(Object.prototype.hasOwnProperty.call(value,key), 'An answer field is missing.'); shape(value[key],child); }
        return;
      }
      assert(value === null || ['string','number','boolean'].includes(typeof value), 'Invalid answer value.');
    }
    function selections(values, scenario) {
      assert(Array.isArray(values) && values.length <= scenario.planes.length && values.every(id => scenario.planes.some(p => p.id === id)) && new Set(values).size === values.length, 'Invalid resource selection.');
    }
    function board(value, scenario) {
      assert(object(value.placements) && object(value.flights), 'Invalid saved checkerboard.');
      for (const [task, day] of Object.entries(value.placements)) assert(scenario.tasks?.some(t => t.id === task) && Number.isInteger(day) && day >= 0 && day < scenario.days.length, 'Invalid work tile.');
      for (const [day, waves] of Object.entries(value.flights)) {
        assert(/^\d+$/.test(day) && Number(day) < (scenario.days?.length || 0) && object(waves), 'Invalid saved day.');
        selections(waves.am || [], scenario); selections(waves.pm || [], scenario);
      }
      Flight.timeline(scenario, value.placements);
    }
    for (const [key, track] of Object.entries(data.tracks)) {
      const [world, skill, extra] = key.split(':');
      assert(worldIDs.includes(world) && skills.includes(skill) && !extra && object(track) && object(track.best), 'Invalid saved track.');
      const engine = skill === 'scheduling' ? Flight : Packs[skill];
      for (const [level, stars] of Object.entries(track.best)) assert(/^\d+$/.test(level) && engine.levels.some(l => l.id === Number(level)) && Number.isInteger(stars) && stars >= 0 && stars <= 3, 'Invalid star record.');
      if (track.last12 !== undefined) {
        assert(skill === 'scheduling' && object(track.last12) && uint(track.last12.seed) && object(track.last12.state), 'Invalid checkerboard carry-over.');
        board(track.last12.state, Flight.make(12,track.last12.seed));
      }
      if (track.current === null || track.current === undefined) continue;
      const c = track.current;
      assert(object(c) && uint(c.seed) && engine.levels.some(l => l.id === c.level) && (c.revision === undefined || [1,2].includes(c.revision)), 'Invalid saved challenge.');
      const s = engine.make(c.level,c.seed,c.revision || 1), p = c.state;
      assert(object(p) && ['am','pm'].includes(p.wave) && ['am','pm'].includes(p.boardWave) && ['work','flights'].includes(p.phase), 'Invalid challenge state.');
      assert(Array.isArray(p.am) && Array.isArray(p.pm) && Array.isArray(p.launched) && Array.isArray(p.confirmed) && object(p.placements) && object(p.flights), 'Invalid challenge state.');
      assert(Number.isInteger(p.mistakes) && p.mistakes >= 0 && Number.isInteger(p.hints) && p.hints >= 0 && typeof p.assisted === 'boolean' && typeof p.won === 'boolean', 'Invalid attempt record.');
      if (skill === 'scheduling') {
        selections(p.am,s); selections(p.pm,s); board(p,s);
        assert(p.selectedTask === null || s.tasks?.some(t => t.id === p.selectedTask), 'Invalid selected work tile.');
        assert(Number.isInteger(p.activeDay) && p.activeDay >= 0 && p.activeDay < Math.max(1,s.days?.length || 0), 'Invalid selected day.');
      } else {
        shape(p.play,s.initial);
        // Exercise the actual readers without changing any progress or rendering HTML.
        engine.meter(s,p.play); engine.check(s,p.play);
        engine.render(s,p.play,{esc:value=>String(value??''),icon:()=>'',asset:()=>'',world:Worlds.worlds[world]});
      }
    }
    return JSON.parse(JSON.stringify(data));
  }
  const api = {validate};
  if (root) root.FMGameBackup = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null);
