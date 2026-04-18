use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiffItem {
    pub r#type: String,
    pub content: String,
    pub line_a: Option<usize>,
    pub line_b: Option<usize>,
}

#[wasm_bindgen]
pub fn calculate_ast_diff(a_json: &str, b_json: &str) -> String {
    let a: Vec<String> = serde_json::from_str(a_json).unwrap_or_default();
    let b: Vec<String> = serde_json::from_str(b_json).unwrap_or_default();
    
    let edits = myers_diff(&a, &b);
    serde_json::to_string(&edits).unwrap()
}

fn myers_diff(a: &[String], b: &[String]) -> Vec<DiffItem> {
    let n = a.len();
    let m = b.len();
    let max = n + m;
    let mut v = HashMap::new();
    v.insert(1, 0);
    
    let mut trace = Vec::new();
    
    for d in 0..=(max as i32) {
        trace.push(v.clone());
        for k in (-d..=d).step_by(2) {
            let mut x = if k == -d || (k != d && v.get(&(k - 1)).cloned().unwrap_or(-1) < v.get(&(k + 1)).cloned().unwrap_or(-1)) {
                v.get(&(k + 1)).cloned().unwrap_or(0)
            } else {
                v.get(&(k - 1)).cloned().unwrap_or(0) + 1
            };
            
            let mut y = x - k;
            while x < n as i32 && y < m as i32 && a[x as usize] == b[y as usize] {
                x += 1;
                y += 1;
            }
            
            v.insert(k, x);
            
            if x >= n as i32 && y >= m as i32 {
                return backtrack(&trace, a, b, n, m);
            }
        }
    }
    Vec::new()
}

fn backtrack(trace: &[HashMap<i32, i32>], a: &[String], b: &[String], n: usize, m: usize) -> Vec<DiffItem> {
    let mut edits = Vec::new();
    let mut x = n as i32;
    let mut y = m as i32;
    
    for d in (0..trace.len()).rev() {
        let v = &trace[d];
        let k = x - y;
        
        let prev_k = if k == -(d as i32) || (k != (d as i32) && v.get(&(k - 1)).cloned().unwrap_or(-1) < v.get(&(k + 1)).cloned().unwrap_or(-1)) {
            k + 1
        } else {
            k - 1
        };
        
        let prev_x = v.get(&prev_k).cloned().unwrap_or(0);
        let prev_y = prev_x - prev_k;
        
        while x > prev_x && y > prev_y {
            edits.push(DiffItem {
                r#type: "unchanged".to_string(),
                content: a[(x - 1) as usize].clone(),
                line_a: Some((x - 1) as usize),
                line_b: Some((y - 1) as usize),
            });
            x -= 1;
            y -= 1;
        }
        
        if d > 0 {
            if x == prev_x {
                edits.push(DiffItem {
                    r#type: "added".to_string(),
                    content: b[(y - 1) as usize].clone(),
                    line_a: None,
                    line_b: Some((y - 1) as usize),
                });
            } else {
                edits.push(DiffItem {
                    r#type: "removed".to_string(),
                    content: a[(x - 1) as usize].clone(),
                    line_a: Some((x - 1) as usize),
                    line_b: None,
                });
            }
        }
        
        x = prev_x;
        y = prev_y;
    }
    
    edits.reverse();
    edits
}
