declare type Unset_t = null | undefined;

declare type Key_t = string;
declare type Value_t = any;
declare type Keys_t = Key_t[];
declare interface Obj_t {
  [key:Key_t]:Value_t;
}

declare type AbsolutePath = string;
declare type RelativePath = string;
declare type Path = AbsolutePath|RelativePath;
declare type ScriptType = "docs" | "sheets" | "slides" | "forms" | "script"