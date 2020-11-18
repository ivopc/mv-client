import { ArrayModel } from "objectmodel";
import MonsterModel from "./Monster";

export const MonstersInParty = new ArrayModel([MonsterModel, null])
    .extend()
    .assert(list => 
        list.length >= 0 && list.length <= 6, 
        "Should have 0 between 6 MonsterModel elements of list"
    );