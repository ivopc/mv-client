class ResourcesDatabaseModel {
	static create ({ character, monster, level, item, monstersExp }) {
		this.character = character;
		this.monster = monster;
		this.level = level;
		this.item = item;
		this.monstersExp = monstersExp;
	}
};

export default ResourcesDatabaseModel;