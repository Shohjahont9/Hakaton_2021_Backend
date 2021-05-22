import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import os

xlsx_files = [f for f in os.listdir(os.path.dirname(__file__))
                if 'xls' in f]

main_file = xlsx_files[1]

print(main_file)
data = pd.read_excel(main_file)

_not_all = data[:100]

_not_all.groupby('№ Раб. станции')['Кол-во произв-ых'].agg(np.median).plot(kind = 'bar')
plt.show()