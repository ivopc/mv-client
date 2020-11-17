// ObjectModel v4.2.2 - http://objectmodel.js.org
// MIT License - Sylvain Pollet-Villard
const t=Object.prototype,e=Object.getPrototypeOf,r=Object.setPrototypeOf,n=(e,r)=>t.hasOwnProperty.call(e,r),i=(t,e)=>e instanceof t,o=t=>"function"==typeof t,s=t=>t&&"object"==typeof t,a=t=>"string"==typeof t,l=r=>s(r)&&e(r)===t,c=t=>t&&o(t[Symbol.iterator]),u=(t,e)=>new Proxy(t,e),f=(t,e={})=>{for(let r in e)if(l(e[r])){const n={};f(n,t[r]),f(n,e[r]),t[r]=n}else t[r]=e[r];return t},p=(t,e,r,n=!1)=>{Object.defineProperty(t,e,{value:r,enumerable:n,writable:!0,configurable:!0})},h=(t,e,n)=>{t.prototype=Object.assign(Object.create(e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),n),r(t,e)},d=Symbol(),g=Symbol(),y=Symbol(),m=(t,e,n,o,s,a)=>{const l=function(t=l.default,e){return a&&!i(l,this)?new l(t):(o&&(t=o(t,l,this)),e===g||A(l,t)?s?u(t,s(l)):t:void 0)};return n&&h(l,n),r(l,e.prototype),l.constructor=e,l.definition=t,l.assertions=[...l.assertions],p(l,"errors",[]),delete l.name,l},v=(t,e,r)=>i(e,t)?t:(s(t)||o(t)||void 0===t||w(e.errors,Object,t),f(r,e.default),e.parentClass&&f(t,new e.parentClass(t)),f(r,t),r),b=(t,e,r)=>(h(t,e,r),t.assertions.push(...e.assertions),t),w=(t,e,r,n,i)=>{t.push({expected:e,received:r,path:n,message:i})},S=(e,r=e.errorCollector)=>{const n=e.errors.length;if(n>0){const n=e.errors.map(e=>{var r;return e.message||(e.message="expecting "+(e.path?e.path+" to be ":"")+j(e.expected)+", got "+(null!=e.received?(r=e.received,t.toString.call(r).match(/\s([a-zA-Z]+)/)[1]+" "):"")+F(e.received)),e});e.errors.length=0,r.call(e,n)}return n},$=t=>t&&e(t)&&i(N,e(t).constructor),O=t=>{if(l(t)){t={};for(let e in t)t[e]=O(t[e])}else{if(!Array.isArray(t))return[t];if(1===t.length)return[t[0],void 0,null]}return t},j=(t,e)=>{const r=O(t).map(t=>F(t,e));return r.length>1?r.join(" or "):r[0]},P=(t,e=[])=>(e.length>0&&(t=[].concat(t,...[].concat(e)).filter((t,e,r)=>r.indexOf(t)===e)),t),A=(t,e)=>(t[d](e,null,t.errors,[],!0),!S(t)),x=(t,e,r,n,o,s)=>{const a=o.indexOf(e);if(-1!==a&&-1!==o.indexOf(e,a+1))return t;if(Array.isArray(e)&&1===e.length&&null!=t&&(e=e[0]),i(N,e))s&&(t=T(t,e)),e[d](t,r,n,o.concat(e));else if(l(e))for(let i in e){const a=t?t[i]:void 0;x(a,e[i],k(r,i),n,o,s)}else{if(O(e).some(e=>C(t,e,r,o)))return s?T(t,e):t;w(n,e,t,r)}return t},C=(t,e,r,n,s)=>{if(e===U)return!0;if(null==t)return t===e;if(l(e)||i(N,e)){const i=[];return x(t,e,r,i,n,s),!i.length}return i(RegExp,e)?e.test(t):e===Number||e===Date?t.constructor===e&&!isNaN(t):t===e||o(e)&&i(e,t)||t.constructor===e},R=(t,e,r,n=e.errors)=>{for(let i of e.assertions){let s;try{s=i.call(e,t)}catch(t){s=t}if(!0!==s){const a=o(i.description)?i.description:(t,e)=>`assertion "${i.description}" returned ${F(t)} for ${r?r+" =":"value"} ${F(e)}`;w(n,i,t,r,a.call(e,s,t,r))}}},F=(e,r=[])=>{if(r.length>15||r.includes(e))return"...";if(null==e)return String(e);if(a(e))return`"${e}"`;if(i(N,e))return e.toString(r);if(r.unshift(e),o(e))return e.name||e.toString();if(i(Map,e)||i(Set,e))return F([...e]);if(Array.isArray(e))return`[${e.map(t=>F(t,r)).join(", ")}]`;if(e.toString&&e.toString!==t.toString)return e.toString();if(s(e)){const t=Object.keys(e),n="\t".repeat(r.length);return`{${t.map(t=>`\n${n+t}: ${F(e[t],[...r])}`).join(", ")} ${t.length?"\n"+n.slice(1):""}}`}return String(e)},k=(t,e)=>t?t+"."+e:e,M=(t,e,r,i,o,s,a)=>{const l=k(r,o),c=t.conventionForPrivate(o),u=t.conventionForConstant(o),f=n(i,o),p=f&&Object.getOwnPropertyDescriptor(i,o);o in e&&(c&&!s||u&&void 0!==i[o])&&D(`modify ${c?"private":"constant"} property ${o}`,t),a(),n(e,o)&&x(i[o],e[o],l,t.errors,[]),R(i,t,l);const h=t.errors.length;return h&&(f?Object.defineProperty(i,o,p):delete i[o],S(t)),!h},D=(t,e)=>{e.errors.push({message:"cannot "+t})},T=(t,e=[])=>{if(!t||l(e)||i(K,e)||$(t))return t;const r=O(e),n=[];for(let e of r)i(N,e)&&!i(K,e)&&e.test(t)&&n.push(e);return 1===n.length?new n[0](t,g):(n.length>1&&console.warn(`Ambiguous model for value ${F(t)}, could be ${n.join(" or ")}`),t)},E=(t,e,r,i)=>({get(s,c){if(c===y)return s;if(!a(c))return Reflect.get(s,c);const f=k(r,c),p=n(e,c),h=e[c];if(!i&&p&&t.conventionForPrivate(c))return D("access to private property "+f,t),void S(t);let d=s[c];return p&&d&&n(s,c)&&!l(h)&&!$(d)&&Reflect.set(s,c,d=T(d,h)),o(d)&&"constructor"!==c&&!i?u(d,{apply(t,e,r){i=!0;const n=Reflect.apply(t,e,r);return i=!1,n}}):(l(h)&&!d&&(s[c]=d={}),((t,e,r,n,i)=>l(r)?u(t,E(e,r,n,i)):T(t,r))(d,t,h,f,i))},set:(n,o,s)=>M(t,e,r,n,o,i,()=>Reflect.set(n,o,T(s,e[o]))),deleteProperty:(n,o)=>M(t,e,r,n,o,i,()=>Reflect.deleteProperty(n,o)),defineProperty:(n,o,s)=>M(t,e,r,n,o,i,()=>Reflect.defineProperty(n,o,s)),has:(r,n)=>Reflect.has(r,n)&&Reflect.has(e,n)&&!t.conventionForPrivate(n),ownKeys:r=>Reflect.ownKeys(r).filter(r=>Reflect.has(e,r)&&!t.conventionForPrivate(r)),getOwnPropertyDescriptor(r,n){let i;return t.conventionForPrivate(n)||(i=Object.getOwnPropertyDescriptor(e,n),void 0!==i&&(i.value=r[n])),i}});function N(t,e){return l(t)?new z(t,e):new K(t)}function K(t){return m(t,K)}function z(t){return m(t,z,Object,v,e=>E(e,t),!0)}Object.assign(N.prototype,{name:"Model",assertions:[],conventionForConstant:t=>t.toUpperCase()===t,conventionForPrivate:t=>"_"===t[0],toString(t){return n(this,"name")?this.name:j(this.definition,t)+((e=this.assertions).length?`(${e.map(t=>t.name||t.description||t)})`:"");var e},as(t){return p(this,"name",t),this},defaultTo(t){return this.default=t,this},[d](t,e,r,n){x(t,this.definition,e,r,n),R(t,this,e,r)},test(t,r){let i=this;for(;!n(i,"errorCollector");)i=e(i);const o=i.errorCollector;let s;return i.errorCollector=t=>{s=!0,r&&r.call(this,t)},new this(t),i.errorCollector=o,!s},errorCollector(t){const e=new TypeError(t.map(t=>t.message).join("\n"));throw e.stack=e.stack.replace(/\n.*object-model(.|\n)*object-model.*/,""),e},assert(t,e=F(t)){return p(t,"description",e),this.assertions=this.assertions.concat(t),this}}),h(K,N,{extend(...t){const e=b(new K(P(this.definition,t)),this);for(let r of t)i(K,r)&&e.assertions.push(...r.assertions);return e}}),h(z,N,{defaultTo(t){const e=this.definition;for(let r in t)n(e,r)&&(t[r]=x(t[r],e[r],r,this.errors,[],!0));return S(this),this.default=t,this},toString(t){return F(this.definition,t)},extend(...t){const r={...this.definition},n={...this.prototype},a={...this.default},l=[];for(let e of t)i(N,e)&&(f(r,e.definition),f(a,e.default),l.push(...e.assertions)),o(e)&&f(n,e.prototype),s(e)&&f(r,e);const c=b(new z(r),this,n).defaultTo(a);return c.assertions=[...this.assertions,...l],e(this)!==z.prototype&&(c.parentClass=this),c},[d](t,e,r,n,i){s(t)?x(t[y]||t,this.definition,e,r,n,i):w(r,this,t,e),R(t,this,e,r)}});const U=u(K(),{apply(t,e,[r]){const n=Object.create(U);return n.definition=r,n}});U.definition=U,U.toString=()=>"Any",U.remaining=function(t){this.definition=t},h(U.remaining,U,{toString(){return"..."+j(this.definition)}}),U[Symbol.iterator]=function*(){yield new U.remaining(this.definition)};const W=(t,e,r,i,s,a,l)=>m(r,e,t,i,e=>Object.assign({getPrototypeOf:()=>e.prototype,get(r,i){if(i===y)return r;const l=r[i];return o(l)?u(l,{apply(o,l,c){if(n(a,i)){const[n,l=c.length-1,u]=a[i];for(let r=n;r<=l;r++){const n=u?u(r):e.definition;c[r]=x(c[r],n,`${t.name}.${i} arguments[${r}]`,e.errors,[],!0)}if(e.assertions.length>0){const t=s(r);o.apply(t,c),R(t,e,`after ${i} mutation`)}S(e)}return o.apply(r,c)}}):l}},l));function Z(t){const e=W(Array,Z,t,t=>Array.isArray(t)?t.map(t=>T(t,e.definition)):t,t=>[...t],{copyWithin:[],fill:[0,0],pop:[],push:[0],reverse:[],shift:[],sort:[],splice:[2],unshift:[0]},{set:(t,r,n)=>_(e,t,r,n,(t,e)=>t[r]=e,!0),deleteProperty:(t,r)=>_(e,t,r,void 0,t=>delete t[r])});return e}h(Z,N,{toString(t){return"Array of "+j(this.definition,t)},[d](t,e,r,n){Array.isArray(t)?(t[y]||t).forEach((t,i)=>x(t,this.definition,`${e||"Array"}[${i}]`,r,n)):w(r,this,t,e),R(t,this,e,r)},extend(...t){return b(new Z(P(this.definition,t)),this)}});const _=(t,e,r,n,i,o)=>{const s=`Array[${r}]`;+r>=0&&(o||r in e)&&(n=x(n,t.definition,s,t.errors,[],!0));const a=[...e];i(a),R(a,t,s);const l=!S(t);return l&&i(e,n),l};function q(...t){return m({arguments:t},q,Function,null,t=>({getPrototypeOf:()=>t.prototype,get:(t,e)=>e===y?t:t[e],apply(e,r,n){const o=t.definition,s=o.arguments.find(t=>i(U.remaining,t)),a=s?Math.max(n.length,o.arguments.length-1):o.arguments.length;for(let e=0;e<a;e++){const r=s&&e>=o.arguments.length-1?s.definition:o.arguments[e];n[e]=x(n[e],r,`arguments[${e}]`,t.errors,[],!0)}let l;return R(n,t,"arguments"),t.errors.length||(l=Reflect.apply(e,r,n),"return"in o&&(l=x(l,o.return,"return value",t.errors,[],!0))),S(t),l}}))}function B(t,e){const r=t=>0===t?n.definition.key:n.definition.value,n=W(Map,B,{key:t,value:e},t=>c(t)?new Map([...t].map(t=>t.map((t,e)=>T(t,r(e))))):t,t=>new Map(t),{set:[0,1,r],delete:[],clear:[]});return n}function G(t){const e=W(Set,G,t,t=>c(t)?new Set([...t].map(t=>T(t,e.definition))):t,t=>new Set(t),{add:[0,0],delete:[],clear:[]});return e}h(q,N,{toString(t=[]){let e=`Function(${this.definition.arguments.map(e=>j(e,[...t])).join(", ")})`;return"return"in this.definition&&(e+=" => "+j(this.definition.return,t)),e},return(t){return this.definition.return=t,this},extend(t,e){const r=this.definition.arguments,n=t.map((e,n)=>P(n in r?r[n]:[],t[n])),i=P(this.definition.return,e);return b(new q(...n).return(i),this)},[d](t,e,r){o(t)||w(r,"Function",t,e)}}),h(B,N,{toString(t){return`Map of ${j(this.definition.key,t)} : ${j(this.definition.value,t)}`},[d](t,e,r,n){if(i(Map,t)){e=e||"Map";for(let[i,o]of t)x(i,this.definition.key,e+" key",r,n),x(o,this.definition.value,`${e}[${F(i)}]`,r,n)}else w(r,this,t,e);R(t,this,e,r)},extend(t,e){return b(new B(P(this.definition.key,t),P(this.definition.value,e)),this)}}),h(G,N,{toString(t){return"Set of "+j(this.definition,t)},[d](t,e,r,n){if(i(Set,t))for(let i of t.values())x(i,this.definition,(e||"Set")+" value",r,n);else w(r,this,t,e);R(t,this,e,r)},extend(...t){return b(new G(P(this.definition,t)),this)}});export{U as Any,Z as ArrayModel,K as BasicModel,q as FunctionModel,B as MapModel,N as Model,z as ObjectModel,G as SetModel};
//# sourceMappingURL=object-model.min.js.map
