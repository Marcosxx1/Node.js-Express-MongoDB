/* eslint-disable prettier/prettier */
// Importa o módulo 'fs'
const Tour = require('./../models/tourModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Middleware que define um alias para as queries de tours
exports.aliasToTours = (req, _res, next) => {
    // Define o limite de itens retornados como 5
    req.query.limit = '5';
    // Ordena os itens por ratingsAverage (ordem decrescente) e price (ordem crescente)
    req.query.sort = '-ratingsAverage,price';
    // Seleciona somente os campos name, price, ratingsAverage, summary e difficulty
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    // Chama a próxima função do middleware
    next();
};

// Classe que define métodos de filtragem, ordenação, seleção e paginação das queries de tours
class APIFeatures {
    // Construtor da classe, recebe uma query e uma string de query
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Método que filtra a query de acordo com a string de query passada
    filter() {
        // Cria uma cópia da string de query
        const queryObj = { ...this.queryString };
        // Define os campos que não serão incluídos na query
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // Remove os campos excluídos da string de query
        excludedFields.forEach((el) => delete queryObj[el]);

        // Aplica filtros avançados se estiverem presentes na string de query
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `${match}`
        );

        // Aplica a query com os filtros
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    // Método que ordena a query de acordo com a string de query passada
    sort() {
        // Ordena a query de acordo com a string de query 'sort'
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Ordena por data de criação caso não haja um campo de ordenação definido
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    // Método que seleciona os campos da query de acordo com a string de query passada
    limitFields() {
        // Seleciona somente os campos especificados na string de query 'fields'
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Remove o campo '__v' caso não haja um campo de seleção definido
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // Método que define a paginação da query de acordo com a string de query passada
    paginate() {
        // Define a página e o limite de itens por página
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

exports.getAllTours = catchAsync(async (req, res, _next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    // Enviando resposta
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    // o código acima é igual a:
    // Tour.findOne({_id: req.params.id})

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.createTour = catchAsync(async (req, res, _next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
    await newTour.save();
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id, req.body);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getTourStats = catchAsync(async (_req, res, _next) => {
    const stats = await Tour.aggregate([
        {
            // $match = selecionar, filtrar documentos
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            // Agrupa documentos juntos, com acumuladores, para médias também
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        } /* ,
    {
      $match: { _id: { $ne: 'EASY' } }
    } */,
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, _next) => {
    const year = req.params.year * 1; // transformando em um número a req que esta chengando
    const plan = await Tour.aggregate([
        {
            /* $unwind descostroi um array que chega do input 
      e da o output um documento para cada elemento do array */
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { numToursStarts: -1 },
        },
        {
            $limit: 6,
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});
