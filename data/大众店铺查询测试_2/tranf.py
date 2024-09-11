import pandas as pd
import json
# 读取 JSON 文件
with open('data_new_2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# 将 DataFrame 保存为 Excel 文件
df.to_excel('output_天津.xlsx', index=False)

print("Excel 文件已生成：output_1.xlsx")
