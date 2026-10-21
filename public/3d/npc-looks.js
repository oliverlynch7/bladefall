// Appearance only. IDs belong to the existing roster; role/context comes from the
// approved dialogue cast. No save fields, generated identities or random palettes.
const look=(name,role,model,cloth,metal,leather,accent,detail,eye='#718e87',brow='natural')=>({name,role,model,cloth,metal,leather,accent,detail,eye,brow});
export const NPC_LOOKS={
 thomas:look('Thomas','Your father','Monk','#426d78','#b9b9a4','#68452f','#bd7150','father','#7392a2'),
 mara:look('Mara','Village medic','Ranger','#9b4658','#e7d8b8','#65483c','#d3b888','medic','#82aa8d','raised'),
 gus:look('Gus','Village carpenter','Monk','#477767','#b9a788','#67442b','#d2a252','carpenter','#9c8057'),
 lewis:look('Lewis','Village scout','Ranger','#4b6543','#b9ad83','#473d2a','#c88f49','scout','#92ad71','focused'),
 beth:look('Beth','Village shepherd','Ranger','#527d9d','#d7c3a3','#6d5242','#e8d8ae','shepherd','#a8bdcf','raised'),
 bethBrother:look('Beth’s brother','Stranded shepherd','Monk','#7b8b65','#a6afa1','#704b32','#b8cee0','shepherdBoy','#82a4b5'),
 grant:look('Grant','Captured guard','Warrior','#924d46','#9ca8ad','#5a4639','#bda867','guard','#879da7','focused'),
 felix:look('Felix','Locksmith','Rogue','#a07637','#a7b5b4','#483f3b','#62a9ad','locksmith','#b3a46c','raised'),
 roland:look('Roland','Armor maker','Monk','#455f79','#abbac4','#684b3c','#c79458','armorer','#8e9d9c'),
 cross:look('Captain Cross','Gate captain','Warrior','#503c61','#8b95a6','#3d3944','#9189b2','hollowOfficer','#abb4bf','straight'),
 ellis:look('Professor Ellis','Rescued researcher','Wizard','#4c8396','#dbccb2','#5a4c40','#dfa94d','researcher','#86b6be','raised'),
 hugo:look('Hugo','Ice-cave explorer','Ranger','#b47b36','#adbdc1','#524b45','#78c2c1','explorer','#7f9fa6','raised'),
 ian:look('Ian','Bladeborn spirit','Monk','#91b5d2','#d8e2db','#65778a','#d8c786','spiritKnight','#c2e7ff'),
 pike:look('Foreman Pike','Furnace overseer','Warrior','#6c563c','#858a89','#403a32','#d4a04d','overseer','#bcc2b6','straight'),
 martin:look('Martin','Worker organizer','Monk','#ac6043','#a9b4ac','#503b30','#8ab19d','organizer','#87a291'),
 caleb:look('Caleb','Escaped prisoner','Monk','#8d7969','#a7a08c','#5a4438','#c1ab81','escapee','#a48a69','raised'),
 skip:look('Skip','Ridge climber','Ranger','#3d8c8a','#c4b593','#64432d','#e29b49','climber','#80bfb3'),
 quartermaster:look('Quartermaster','Supplies and equipment','Monk','#355e85','#d2af64','#64432a','#e0c58c','merchant','#9eaa96'),
 anvil:look('The Smith','Forge and equipment','Monk','#83422f','#a8b6bd','#3a3028','#dea660','smith','#a88c66','focused'),
 keeper:look('The Stylist','Appearance and cosmetics','Cleric','#77518d','#d8b779','#4e3b56','#e48eac','tailor','#bc96bd','raised'),
 drillmaster:look('Drillmaster','Classes and training','Warrior','#9c4d43','#acb7be','#513b2d','#d3b56c','trainer','#90a6ad','focused'),
 beastkeeper:look('Beastkeeper','Companions and training','Ranger','#6c8242','#bda881','#614c31','#dba65f','handler','#a9b16f'),
 flint:look('Flint','Captive smith','Monk','#4f6c72','#b3a999','#504038','#d2a579','captiveSmith','#ac9b79','focused'),
 jack:look('Jack','Furnace repairer','Ranger','#a66a39','#aebdb0','#59482f','#98ab7b','repairer','#91a2a8'),
 miles:look('Miles','Castle servant','Monk','#54757b','#bdbbaa','#41434a','#e1d4af','servant','#8db0aa','raised'),
 ward:look('Captain Ward','Holding-yard officer','Warrior','#354e60','#9dabb4','#403e42','#9198ae','yardOfficer','#b5bac7','straight'),
 ruth:look('Ruth','Prisoner organizer','Ranger','#66947f','#d3bea4','#6f513f','#c49061','refugee','#91bfa4','focused'),
 grace:look('Sister Grace','Palace caretaker','Ranger','#e6dcc0','#d4b472','#7e7159','#589eae','caretaker','#9db1ab'),
 victor:look('Sergeant Victor','Palace defender','Warrior','#3c7298','#d2c495','#594b38','#8dbfb7','palaceGuard','#83a7bd','focused'),
 walter:look('Walter','Prison stoneworker','Monk','#817c5d','#bcb7a5','#574133','#ba8d5d','mason','#9d9778'),
 sly:look('Sly','Prison thief','Rogue','#4b6662','#a6a38a','#49342e','#b89152','thief','#aeb48b','focused'),
 riftkeeper:look('Rift Keeper','Training-rift guide','Cleric','#8562a5','#d3bce7','#493b69','#9cd6dc','rift','#c5b5ea'),
 mentor_berserker:look('Berserker Mentor','Berserker discipline','Warrior','#93412e','#bfa888','#49352c','#d8b994','berserker','#d3a36a','focused'),
 mentor_ninja:look('Ninja Mentor','Ninja discipline','Rogue','#8c3548','#c0ada6','#372f3d','#d0a45f','ninja','#cbb18b','focused'),
 mentor_reaper:look('Reaper Mentor','Reaper discipline','Rogue','#5f476e','#c6bbb0','#332e3e','#ad87d3','reaper','#bb9adf'),
 mentor_chronomancer:look('Chronomancer Mentor','Chronomancer discipline','Wizard','#267e86','#d9b76e','#414b51','#7cd3dc','chronomancer','#76bfcb'),
 mentor_pirate:look('Pirate Mentor','Pirate discipline','Rogue','#31696e','#d0ac60','#5b3c2c','#a64e43','pirate','#96c3b6'),
 mentor_paladin:look('Paladin Mentor','Paladin discipline','Cleric','#e0d9b7','#ceac61','#655844','#79b9cb','paladin','#a5cbd8'),
 mentor_necromancer:look('Necromancer Mentor','Necromancer discipline','Wizard','#52665d','#d7ceb1','#3c3d35','#8dba9c','necromancer','#9ebaa2'),
 mentor_pyromancer:look('Pyromancer Mentor','Pyromancer discipline','Wizard','#a23f28','#d8ae60','#51362c','#ed9b45','pyromancer','#d1a26a','focused'),
 otto:look('Otto','Boatbuilder','Monk','#436c86','#b5a88c','#705034','#ddbe80','boatbuilder','#94b5c7'),
 rose:look('Captain Rose','Retired captain','Rogue','#344f75','#d1b76f','#543d30','#ac6557','captain','#a3b7c8'),
 hugh:look('Master Hugh','Senior library keeper','Wizard','#5e476a','#cfb587','#51433b','#c2aa83','archivist','#bca2bc'),
 simon:look('Simon','Junior library keeper','Ranger','#3b8b90','#c4ad78','#614735','#e2cc91','librarian','#90c1be','raised'),
 heath:look('Heath','Mountain guide','Ranger','#4e7795','#c5c6ba','#695348','#e1b96b','mountaineer','#a6bcc7'),
 abe:look('Abe','Island fisher','Monk','#5c8e86','#c7baa2','#705840','#d6ad61','fisher','#94b5a8'),
 dash:look('Dash','Young scavenger','Rogue','#af7942','#bbb4a5','#59402f','#5fb7b0','scavenger','#afad79','raised'),
 shade:look('Warden’s Shade','Regional guide','Warrior','#7b789d','#c1c9dc','#4a4a60','#b3c7e3','shade','#bec7ec'),
};
// Existing escort identities get practical variations, not medals or weapons.
const extras={
 ascent_worker_a:['Tower worker','Monk','#a28264','servant'],ascent_worker_b:['Tower repairer','Ranger','#687c84','repairer'],
 iron_worker0:['Furnace worker','Monk','#a57550','captiveSmith'],iron_worker1:['Furnace worker','Rogue','#9b836a','refugee'],iron_worker2:['Furnace worker','Ranger','#7a8373','repairer'],
 prison_escape0:['Freed prisoner','Monk','#958471','escapee'],prison_escape1:['Freed prisoner','Ranger','#778b79','refugee'],prison_escape2:['Freed prisoner','Rogue','#7b8190','escapee'],prison_escape3:['Freed prisoner','Monk','#9c7b70','refugee'],
 keep_escape0:['Freed captive','Monk','#a08c77','escapee'],keep_escape1:['Freed captive','Ranger','#84957c','refugee'],keep_escape2:['Freed captive','Rogue','#86929c','escapee'],
 canyon_south:['Canyon captive','Monk','#a58b68','escapee'],canyon_north:['Canyon captive','Monk','#7c938a','refugee'],canyon_north_b:['Canyon captive','Ranger','#789569','refugee'],canyon_extra:['Canyon captive','Monk','#a59874','escapee'],
};
for(const [id,[name,model,cloth,detail]]of Object.entries(extras))NPC_LOOKS[id]=look(name,'Escort',model,cloth,'#b7b19b','#665040','#cfb58b',detail);
// Natural hair/beard variation, without tinting faces, hoods or officer armour.
const hair={thomas:'#8d806f',gus:'#725037',bethBrother:'#8d623d',ellis:'#c3b7a2',hugh:'#e1d6c5',quartermaster:'#5a4840',anvil:'#55504a',keeper:'#b8a2bb',roland:'#8b8380',martin:'#71523e',caleb:'#a68e70',flint:'#7d6857',miles:'#a19a89',walter:'#a09c8c',otto:'#826953',abe:'#b8ae98',ian:'#dbdecd',mentor_chronomancer:'#d5c2a1',mentor_necromancer:'#c2bba3',mentor_pyromancer:'#ad7254',mentor_paladin:'#c9bda0'};
for(const [id,color]of Object.entries(hair))NPC_LOOKS[id].hair=color;
for(const id of ['thomas','quartermaster','keeper','beastkeeper','simon','abe'])NPC_LOOKS[id].mouth='smile';
export const NPC_ALIASES={smith:'anvil',stylist:'keeper',warden_shade:'shade',beth_brother:'bethBrother'};
export function npcLook(id){return NPC_LOOKS[NPC_ALIASES[id]||id]||NPC_LOOKS[id?.replace(/_b$/,'')]||null;}
export const NPC_MODELS={Warrior:'warrior',Ranger:'ranger',Wizard:'mage',Cleric:'paladin',Monk:'monk',Rogue:'ninja'};
