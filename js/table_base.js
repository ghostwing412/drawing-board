/**
 * Created by ghost on 2017/3/11.
 */
function inheritProperty(subType, superType) {
    var prototype = Object.create(superType.prototype);//创建对象
    // console.log(prototype);
    prototype.constructor = subType;//增强对象
    // console.log(prototype);
    subType.prototype = prototype;//指定对象
}
function SuperType(name){
    this.name = name;
    this.colors = ["red","blue","green"];
    this.sayColor = function () {
        console.log(this.colors);
    }
}
SuperType.prototype.sayName = function (){
    console.log(this.name);
};
// SuperType.prototype.sayColor = function () {
//     console.log(this.colors);
// };
function SubType(name,age){
    SuperType.call(this,name);
    this.name = name + '！';
    this.age = age;
    this.sayColor = function () {
        console.log(SubType.prototype.colors);
    }
}
inheritProperty(SubType,SuperType);
SubType.prototype.colors = 1;
SubType.prototype.sayAge = function() {
    console.log(this.age);
};
SubType.prototype.sayColor = function () {
    console.log(SubType.prototype.colors);
};
function SubType2(name,tall){
    SuperType.call(this,name);
    this.tall = tall;
}
inheritProperty(SubType2, SuperType);
var t1 = new SuperType('夏雨');
var t2 = new SubType('扬', 28);
var t3 = new SubType2('李', 170);
console.log(t1,t2,t3);
t1.sayName();
t2.sayName();
t3.sayName();
// t2.colors = 1;
t1.sayColor();
t2.sayColor();
t3.sayColor();