// //btnnew.addEventListener('click',init);
// const score0=document.querySelector('#score--0');
// const score1=document.querySelector('#score--1');
// const curr0=document.querySelector('.current--0');
// const curr1=document.querySelector('.current--1');
// const dice=document.querySelector('.dice');

// const btnroll=document.querySelector('.btn--roll');
// const btnhold=document.querySelector('.btn--hold');
// const btnnew=document.querySelector('.btn--new');
// let currentscore=0;
// let activeplayer=0;
// let score;
// let play=true;
// function init()
// {
// score=[0,0];
// score0.textContent=0;
// score1.textContent=0;
// curr0.textContent=0;
// curr1.textContent=0;
// dice.classList.add('hidden');
// document.querySelector(`.player--${activeplayer}`).classList.add('player--active');
// };
// init();
// function switchPlayer()
// {
// currentscore=0;
// document.querySelector(`.player--${activeplayer}`).classList.remove('player--active');
// document.querySelector(`#current--${activeplayer}`).textContent=currentscore;
// activeplayer=activeplayer==0?1:0;
// document.querySelector(`.player--${activeplayer}`).classList.add('player--active');
// }
// btnroll.addEventListener('click',function(){
// if(play){
// randNo=Math.trunc(Math.random()*6+1);
// dice.classList.remove('hidden');
// dice.src=`dice-${randNo}.png`;
// if(randNo!=1)
// {

//     currentscore+=randNo;
//     document.querySelector(`#current--${activeplayer}`).textContent=currentscore;

// }
// else{
//     switchPlayer();
// }
// }
// });

// btnhold.addEventListener('click', function(){
// if(play){
// score[activeplayer]+=currentscore;
// document.querySelector(`#score--${activeplayer}`).textContent=score[activeplayer];
// if(score[activeplayer]>=20)
// {
//     document.querySelector(`.player--${activeplayer}`).classList.add('player--winner');
//     dice.classList.add('hidden');
//     play=false;
// }
// else{
//     switchPlayer();
// }
// }
// });
//  btnnew.addEventListener('click',init);



const score0 = document.querySelector('#score--0');
const score1 = document.querySelector('#score--1');
const curr0 = document.querySelector('#current--0');
const curr1 = document.querySelector('#current--1');
const dice = document.querySelector('.dice');
const btnroll = document.querySelector('.btn--roll');
const btnhold = document.querySelector('.btn--hold');
const btnnew = document.querySelector('.btn--new');
let currentscore = 0;
let activeplayer = 0;
let score;
let play = true;

function init() {
    score = [0, 0];
    score0.textContent = 0;
    score1.textContent = 0;
    curr0.textContent = 0;
    curr1.textContent = 0;
    currentscore=0;
    play=true;
    dice.classList.add('hidden');
    document.querySelector(`.player--${activeplayer}`).classList.remove('player--winner');
    document.querySelector(`.player--${activeplayer}`).classList.remove('player--active');
    activeplayer=0;
    document.querySelector(`.player--${activeplayer}`).classList.add('player--active');
}

function switchPlayer() {
    currentscore = 0;   
    document.querySelector(`.player--${activeplayer}`).classList.remove('player--active');
    document.querySelector(`#current--${activeplayer}`).textContent = currentscore;
    activeplayer = (activeplayer == 0 ? 1 : 0); //agar active player ki value phla zero thi to change to player 1 elsevie versa
    document.querySelector(`.player--${activeplayer}`).classList.add('player--active');
}

btnroll.addEventListener('click', function() {
    if (play) {
        let randNo = Math.trunc(Math.random() * 6 + 1);
        dice.classList.remove('hidden');
        dice.src = `dice-${randNo}.png`;
        if (randNo != 1) {
            currentscore += randNo;
            document.querySelector(`#current--${activeplayer}`).textContent = currentscore;
        } 
        else {
            switchPlayer();
        }
    }
});

btnhold.addEventListener('click', function() {
    if (play) {
        score[activeplayer] += currentscore;
        document.querySelector(`#score--${activeplayer}`).textContent = score[activeplayer];
        if (score[activeplayer] >= 20) {
            document.querySelector(`.player--${activeplayer}`).classList.add('player--winner');
            dice.classList.add('hidden');
            play = false;
        } else {
            switchPlayer();
        }
    }
});

btnnew.addEventListener('click', init);
