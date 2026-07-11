const pwInput = document.getElementById('pw');
const face = document.getElementById('face');
const ringFg = document.getElementById('ring-fg');
const pctVal = document.getElementById('pct-val');
const tagsEl = document.getElementById('tags');
const crackTimeEl = document.getElementById('crack-time');
const reviewEl = document.getElementById('review');
const pwOut = document.getElementById('pw-out');
const copyBtn = document.getElementById('copy-btn');

let showing = true;
face.addEventListener('click', () => {
  showing = !showing;
  pwInput.type = showing ? 'password' : 'text';
  face.textContent = showing ? '🙈' : '👁️';
});
pwInput.type = 'text';
showing = false;
face.textContent = '👁️';

const GUESSES_PER_SECOND = 1e10;
const MAX_ANALYZE_LENGTH = 100; // zxcvbn can freeze the page on very long repetitive input
let analyzeTimer = null;

function formatCrackTime(seconds){
  if (seconds < 1) return "Instantly";
  if (seconds < 60) return seconds.toFixed(2) + " seconds";
  const minutes = seconds/60;
  if (minutes < 60) return minutes.toFixed(1) + " minutes";
  const hours = minutes/60;
  if (hours < 24) return hours.toFixed(1) + " hours";
  const days = hours/24;
  if (days < 30) return days.toFixed(1) + " days";
  const months = days/30;
  if (months < 12) return months.toFixed(1) + " months";
  const years = days/365;
  if (years < 100) return years.toFixed(1) + " years";
  if (years < 1e6) return Math.round(years).toLocaleString() + " years";
  if (years < 1e9) return (years/1e6).toFixed(1) + " million years";
  if (years < 1e12) return (years/1e9).toFixed(1) + " billion years";
  return "More than a trillion years";
}

function colorForScore(score){
  if (score <= 1) return getComputedStyle(document.documentElement).getPropertyValue('--red').trim();
  if (score === 2) return getComputedStyle(document.documentElement).getPropertyValue('--amber').trim();
  return getComputedStyle(document.documentElement).getPropertyValue('--green').trim();
}

function labelForScore(score){
  return ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score];
}

function analyze(){
  const val = pwInput.value;
  pwOut.textContent = val || '—';

  if (!val){
    pctVal.textContent = '0%';
    ringFg.style.stroke = 'var(--border)';
    ringFg.setAttribute('stroke-dashoffset', 264);
    tagsEl.innerHTML = '';
    crackTimeEl.textContent = '—';
    reviewEl.textContent = 'Enter a password to see its evaluation.';
    return;
  }

  const result = zxcvbn(val.slice(0, MAX_ANALYZE_LENGTH));
  const score = result.score; // 0-4, already accounts for repeats/sequences/dictionary
  const pct = (score/4)*100;

  pctVal.textContent = Math.round(pct) + '%';
  const col = colorForScore(score);
  ringFg.style.stroke = col;
  const offset = 264 - (264*pct/100);
  ringFg.setAttribute('stroke-dashoffset', offset);

  const seconds = result.guesses / GUESSES_PER_SECOND;
  crackTimeEl.textContent = formatCrackTime(seconds);

  // Build tags from detected pattern types (matches, not guessed length)
  const patternTypes = new Set(result.sequence.map(m => m.pattern));
  const tags = [];

  if (val.length >= 15) tags.push({t:'Good length', c:'ok'});
  else tags.push({t:'Length too short', c:'bad'});

  if (patternTypes.has('repeat')) tags.push({t:'Repeated characters', c:'bad'});
  if (patternTypes.has('sequence')) tags.push({t:'Contains a predictable sequence', c:'bad'});
  if (patternTypes.has('spatial')) tags.push({t:'Common keyboard pattern', c:'bad'});
  if (patternTypes.has('date')) tags.push({t:'Predictable date', c:'bad'});
  if (patternTypes.has('dictionary')){
    tags.push({t:'Common dictionary word', c:'bad'});
  } else {
    tags.push({t:'Not a common word', c:'ok'});
  }

  const hasLower = /[a-z]/.test(val);
  const hasUpper = /[A-Z]/.test(val);
  const hasNum = /[0-9]/.test(val);
  const hasSym = /[^a-zA-Z0-9]/.test(val);
  const variety = [hasLower,hasUpper,hasNum,hasSym].filter(Boolean).length;
  if (variety >= 3) tags.push({t:'Good mix of characters, numbers and symbols', c:'ok'});
  else tags.push({t:'Limited mix of character types', c:'warn'});

  tagsEl.innerHTML = tags.map(tg => `<span class="tag ${tg.c}">${tg.t}</span>`).join('');

  // Review text mirrors the actual detected weaknesses
  let reasons = [];
  if (patternTypes.has('repeat')) reasons.push('repeated characters');
  if (patternTypes.has('sequence')) reasons.push('a simple sequence like 1234 or abcd');
  if (patternTypes.has('dictionary')) reasons.push('a common, easily guessable word');
  if (patternTypes.has('spatial')) reasons.push('a common keyboard pattern');

  if (score <= 1){
    reviewEl.textContent = reasons.length
      ? `Warning: this password is very weak because it contains ${reasons.join(', ')}. Even though it's long, password-cracking systems can spot patterns like this almost instantly.`
      : 'Warning: this password is weak. Use characters that are harder to predict.';
  } else if (score === 2){
    reviewEl.textContent = 'This password is fair. Avoid common patterns to make it truly strong.';
  } else {
    reviewEl.textContent = reasons.length
      ? `This password is strong, but it does contain ${reasons.join(', ')} — consider avoiding that.`
      : 'This password is strong, with no common patterns detected.';
  }
}

pwInput.addEventListener('input', () => {
  clearTimeout(analyzeTimer);
  analyzeTimer = setTimeout(analyze, 150);
});

copyBtn.addEventListener('click', () => {
  if (!pwInput.value) return;
  navigator.clipboard.writeText(pwInput.value).then(() => {
    copyBtn.textContent = '✓ Copied';
    setTimeout(() => copyBtn.textContent = '📋 Copy', 1200);
  });
});

document.getElementById('btn-light').addEventListener('click', () => {
  document.documentElement.setAttribute('data-theme','light');
  document.getElementById('btn-light').classList.add('active');
  document.getElementById('btn-dark').classList.remove('active');
});
document.getElementById('btn-dark').addEventListener('click', () => {
  document.documentElement.removeAttribute('data-theme');
  document.getElementById('btn-dark').classList.add('active');
  document.getElementById('btn-light').classList.remove('active');
});

// no prefilled password on load — avoids freezing the page on startup
analyze();

const lenSlider = document.getElementById('len-slider');
const lenVal = document.getElementById('len-val');
lenSlider.addEventListener('input', () => lenVal.textContent = lenSlider.value);

function generatePassword(){
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let pool = '';
  if (document.getElementById('chk-upper').checked) pool += upper;
  if (document.getElementById('chk-lower').checked) pool += lower;
  if (document.getElementById('chk-num').checked) pool += nums;
  if (document.getElementById('chk-sym').checked) pool += syms;

  if (!pool){
    pwOut.textContent = 'Please select at least one character type';
    return;
  }

  const length = parseInt(lenSlider.value, 10);
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++){
    result += pool[array[i] % pool.length];
  }
  pwOut.textContent = result;
  pwInput.value = result;
  pwInput.type = 'text';
  showing = false;
  face.textContent = '👁️';
  analyze();
}

document.getElementById('gen-btn').addEventListener('click', generatePassword);
